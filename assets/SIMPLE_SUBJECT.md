# ft_transcendence Project Overview

## Mandatory Requirements

### Basic Game Functionality

- Implement a Pong game where users can play against each other **using the same keyboard**.
- Develop a **tournament system** allowing multiple players to take turns.
- Allow players to input their **alias names** at the start of a tournament.
- Implement a **matchmaking system** that organizes matchups and announces the next game.
- Ensure all players have identical paddle speeds and adhere to the same game rules.

### Technical Constraints

- **Frontend**: Must be developed using **pure vanilla JavaScript** (unless overridden by a module).
- **Backend**: Optional. If included, must be written in **pure Ruby** (unless overridden by a module).
- The website must be a **single-page application**.
- Must be compatible with the **latest stable version of Google Chrome**.
- Users should encounter **no unhandled errors** or **warnings** when browsing.
- Deployment must be with a **single command** using **Docker**.

### Security Concerns

- **Passwords** must be **hashed** using a strong algorithm.
- Protect against **SQL injections** and **Cross-Site Scripting (XSS)** attacks.
- Enable **HTTPS** for all aspects of the website.
- Implement **input validation** for forms and user input.

---

## Optional Modules

### Web
- **Major Module**: Use a Backend Framework (Django)
- **Major Module**: Store Tournament Scores on Blockchain (Ethereum, Solidity)
- **Minor Module**: Use a Front-End Framework or Toolkit (Bootstrap)
- **Minor Module**: Use a Database for the Backend (PostgreSQL)

### User Management
- **Major Module**: Standard User Management
- **Major Module**: Implement Remote Authentication (OAuth 2.0 with 42)

### Gameplay and User Experience
- **Major Module**: Remote Players
- **Major Module**: Multiplayer (More than 2 Players)
- **Major Module**: Add Another Game with User History and Matchmaking
- **Major Module**: Live Chat
- **Minor Module**: Game Customization Options

### AI and Algorithms
- **Major Module**: Introduce an AI Opponent
- **Minor Module**: User and Game Stats Dashboards

### Cybersecurity
- **Major Module**: Implement WAF/ModSecurity and HashiCorp Vault
- **Major Module**: Implement Two-Factor Authentication (2FA) and JWT
- **Minor Module**: GDPR Compliance Options

### DevOps
- **Major Module**: Infrastructure Setup for Log Management (ELK)
- **Major Module**: Designing the Backend as Microservices
- **Minor Module**: Monitoring System (Prometheus/Grafana)

### Graphics
- **Major Module**: Use of Advanced 3D Techniques (Three.js/WebGL)

### Accessibility
- **Minor Module**: Support on All Devices
- **Minor Module**: Expanding Browser Compatibility
- **Minor Module**: Multiple Language Support
- **Minor Module**: Accessibility for Visually Impaired Users
- **Minor Module**: Server-Side Rendering (SSR) Integration

### Server-Side Pong
- **Major Module**: Replace Basic Pong with Server-Side Pong and Implement API
- **Major Module**: Enable Pong Gameplay via CLI Against Web Users

