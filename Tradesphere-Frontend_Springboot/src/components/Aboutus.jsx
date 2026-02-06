import React, { useState } from "react";
import { useEffect, useRef } from "react";
import "./Aboutus.css";

function TypingText({ text, speed = 30 }) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    indexRef.current = 0;

    const type = () => {
      indexRef.current += 1;
      setDisplayedText(text.slice(0, indexRef.current));

      if (indexRef.current < text.length) {
        timeoutRef.current = setTimeout(type, speed);
      }
    };

    timeoutRef.current = setTimeout(type, speed);

    return () => clearTimeout(timeoutRef.current);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}



function AboutUs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const teamMembers = [
    {
      name: "Prateek Gupta",
      role: "Full Stack Developer",
      img: "src/assets/pratik.jpeg",
      bio: "Builds and maintains end-to-end features across frontend and backend, focusing on performance, reliability, and clean system design."
    },
    {
      name: "Hrishikesh Tappe",
      role: "Full Stack Developer",
      img: "src/assets/hrushikesh.jpeg",
      bio: "Works across the full stack to design scalable architectures, integrate APIs, and ensure smooth interaction between client and server."
    },
    {
      name: "Sachin Waghchaure",
      role: "Frontend Developer",
      img: "src/assets/sachin.jpeg",
      bio: "Specializes in crafting intuitive, responsive user interfaces with a strong emphasis on usability, accessibility, and visual consistency."
    },
    {
      name: "Nikhil Shingare",
      role: "Backend Developer",
      img: "src/assets/nikhil.jpeg",
      bio: "Develops and maintains backend services, databases and focus on security, scalability, and efficient data handling."
    },
    {
      name: "Yukta Jadhav",
      role: "Frontend Developer",
      img: "src/assets/yukta.jpeg",
      bio: "Transforms design concepts into interactive frontend experiences, ensuring smooth user journeys and modern UI implementation."
    }
  ];

  const toggleBio = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1>About TradeSphere</h1>
        <p>
          Empowering traders and investors with transparent tools and
          intuitive insights — built for everyone.
        </p>
      </section>

      {/* Mission & Story */}
      <section className="about-story">
        <div className="container">
          <h2>Our Story</h2>
          <p>
            TradeSphere was born with a simple idea — eliminate barriers for
            traders and investors by providing a clear, affordable, and
            technology-first platform.
          </p>
          <p>
            We believe in transparency, fairness, and powerful yet easy
            experiences that help people grow their financial confidence.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="container stats-grid">
          <div className="stat-card">
            <h3>Fast Growth</h3>
            <p>Thousands of users and counting</p>
          </div>
          <div className="stat-card">
            <h3>Powerful Tools</h3>
            <p>Live prices, charts, and portfolio insights</p>
          </div>
          <div className="stat-card">
            <h3>Community Driven</h3>
            <p>Built with real traders in mind</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <div className="container">
          <h2>Meet the Team</h2>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={index}>
                <img
                  src={member.img}
                  alt={member.name}
                  className="avatar"
                  onClick={() => toggleBio(index)}
                />

                <h4>{member.name}</h4>

                <p
                  className="role clickable"
                  onClick={() => toggleBio(index)}
                >
                  {member.role}
                </p>

                {activeIndex === index && (
                  <p className="bio">
                    <TypingText text={member.bio} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Join Us Today</h2>
        <p>Sign up and start tracking your stocks & crypto effortlessly.</p>
      </section>
    </div>
  );
}

export default AboutUs;
