# ft_transcendence

Developing a full-stack web application where users can register, log in, play a pong game, participate in tournaments, view their game states, and interact socially through features like friends, matchmaking and profiles.

## Getting Started

1. Clone the repository and navigate to the project root.
2. Create .hashicorp file and add hashicorp credentials (HCP_CLIENT_ID, HCP_CLIENT_SECRET).
3. Run `make up` to build docker images and start containers.
4. Visit the app in your browser at https://localhost:8443/.

## Maintenance Commands

- Run `make down` to stop and remove docker containers and network.
- Run `make clean` to completely clean the environment (containers, images, volumes, orphaned services, and .env file).
