import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button, Form, Card } from "react-bootstrap";
import "./ChatWidget.css";

const CHAT_API = "http://localhost:8080/api/chat";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your TradeSphere Assistant. Ask me about crypto or stocks!", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        try {
            const res = await axios.post(CHAT_API, { message: userMsg.text });
            const botMsg = { text: res.data.response, sender: "bot" };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [...prev, { text: "Sorry, I couldn't reach the chat server.", sender: "bot" }]);
        }
    };

    return (
        <div className="chat-widget-container">
            {/* Floating Button */}
            {!isOpen && (
                <div className="chat-toggle-btn" onClick={toggleChat}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                        alt="Chat Bot"
                        className="bot-icon"
                    />
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className="chat-window shadow-lg border-0">
                    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                        <span className="fw-bold">TradeSphere Bot 🤖</span>
                        <Button size="sm" variant="transparent" className="text-white p-0" onClick={toggleChat}>
                            ✕
                        </Button>
                    </Card.Header>
                    <Card.Body className="chat-body bg-dark">
                        <div className="messages-list">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`message-bubble ${msg.sender}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </Card.Body>
                    <Card.Footer className="bg-secondary p-2">
                        <Form onSubmit={handleSend} className="d-flex gap-2">
                            <Form.Control
                                size="sm"
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="bg-dark text-white border-secondary"
                            />
                            <Button type="submit" size="sm" variant="light">
                                ➤
                            </Button>
                        </Form>
                    </Card.Footer>
                </Card>
            )}
        </div>
    );
}
