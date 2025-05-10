# ft_transcendence

Developing a full-stack web application where users can register, log in, play a pong game, participate in tournaments, view their game states, and interact socially through features like friends, matchmaking and profiles.

## Getting Started

1. Clone the repository and navigate to the project root.
2. Run `make up` to build docker images and start containers.
3. Visit the app in your browser at https://localhost:8443/.

**Security Notice**: This repository includes a .hashicorp file containing example credentials for illustrative purposes only, as part of a student project. Do not upload any real credentials, .env files, or other sensitive information to GitHub under any circumstances.

## Maintenance Commands

- Run `make down` to stop and remove docker containers and network.
- Run `make clean` to completely clean the environment (containers, images, volumes, orphaned services, and .env file).
