package com.tradesphere.tradepherebackend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.tradesphere.tradepherebackend.dto.PaymentVerificationRequest;
import com.tradesphere.tradepherebackend.model.Wallet;
import com.tradesphere.tradepherebackend.repository.WalletRepository;
import com.tradesphere.tradepherebackend.service.UserService;
import com.tradesphere.tradepherebackend.service.WalletService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/razor")
@CrossOrigin(origins = "http://localhost:5173")
public class RazorPayController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final UserService userService;
    private final WalletService walletService;
    private final WalletRepository walletRepository;

    public RazorPayController(UserService userService, WalletService walletService, WalletRepository walletRepository) {
        this.userService = userService;
        this.walletService = walletService;
        this.walletRepository = walletRepository;
    }

    @GetMapping("/get-key")
    public ResponseEntity<Map<String, String>> getRazorpayKey() {
        Map<String, String> response = new HashMap<>();
        response.put("key", razorpayKeyId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestParam Double amount,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            if (amount == null || amount <= 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid amount. Amount must be greater than 0.");
                return ResponseEntity.badRequest().body(error);
            }

            // Convert amount to paise (multiply by 100)
            int amountInPaise = (int) (amount * 100);

            // Create Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Create order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("order_id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("status", order.get("status"));

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/verify-and-add")
    public ResponseEntity<Map<String, Object>> verifyAndAdd(
            @RequestBody PaymentVerificationRequest request,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // Validate request
            if (request.getRazorpay_order_id() == null || request.getRazorpay_payment_id() == null
                    || request.getRazorpay_signature() == null || request.getAmount() == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Missing required payment details");
                return ResponseEntity.badRequest().body(error);
            }

            if (request.getAmount() <= 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid amount");
                return ResponseEntity.badRequest().body(error);
            }

            // Verify payment signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpay_order_id());
            options.put("razorpay_payment_id", request.getRazorpay_payment_id());
            options.put("razorpay_signature", request.getRazorpay_signature());

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isSignatureValid) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Payment signature verification failed");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Get user and wallet
            String email = principal.getName();
            var user = userService.findByEmail(email);
            var wallet = walletService.getOrCreateWallet(user);

            // Credit wallet
            wallet.setBalance(wallet.getBalance() + request.getAmount());
            Wallet updatedWallet = walletRepository.save(wallet);

            // Prepare success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified and wallet credited successfully");
            response.put("balance", updatedWallet.getBalance());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Payment verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
