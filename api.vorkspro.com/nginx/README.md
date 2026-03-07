# Nginx configs (API repo)

Example configs for running the VorksPro API behind nginx.

- **loadbalancer.conf.example** — Reverse proxy + load balancing across multiple API instances (round-robin / least_conn). Copy to your nginx sites-available and adjust `server_name` and upstream ports. Separate upstreams per platform (`vorkspro_web`, `vorkspro_mobile`, `vorkspro_desktop`) so each can be scaled independently.

**See also:** `../load-balancer/README.md` for the Node.js round-robin proxy option.
