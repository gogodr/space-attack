# Space Attack — Browser Game

Play the deployed game: **https://space-attack-mu.vercel.app**. Hosted on Vercel with a shared, nickname-only Neon leaderboard. [Deployment guide](DEPLOYMENT.md) records configuration, verification and future deployment commands. [Sprite assets](art/sprites/README.md) records the animated retro atlas and exact generation prompts.

Also available on [Codex Sites](https://space-attack-arcade-gogodr.thegogodr.chatgpt.site), private to the owner by default, with the same shared leaderboard.

## Start here

- [Game plan](GAME_PLAN.md): gameplay, accepted tuning, technical direction, and shared online leaderboard requirements.
- [Development roadmap](ROADMAP.md): milestone sequence and release criteria.
- [Work backlog](BACKLOG.md): 29 implementation tickets with owners, dependencies, acceptance criteria, and verification.
- [Development agents](agents/README.md): seven role briefs, explicit skills, shared invariants, ownership, and handoff format.

The first playable implementation is available. Run `npm install`, then `npm run dev`, and open http://127.0.0.1:5173. Requires Node 22.13 or newer. [Development and verification](DEVELOPMENT.md) covers setup, checks, current scope, and remaining release work. [Backend setup](BACKEND_SETUP.md) covers persistent shared scores and hosting requirements.

## Using an agent brief during development

Assign a Ready backlog ticket with a bounded scope and provide its owner role file plus the shared agent contract. Example:

> Work on SA-05 from BACKLOG.md using agents/PHYSICS_RENDERING.md and agents/README.md. Follow GAME_PLAN.md and the repository instructions. Coordinate any interface changes with the technical lead. Implement the ticket, run its meaningful verification, and report the shared handoff fields before marking it complete.

Continue with the remaining Review/In-progress tickets in BACKLOG.md. The technical lead coordinates shared interfaces and integration. Role files describe specialist responsibilities; parallel execution should only be used when authorized and supported by available tooling.

