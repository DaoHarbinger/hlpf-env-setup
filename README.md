## Student
- Name: Федоренко Олександр Романович
- Group: 232/1

## Results of commands

```text
> docker --version
Docker version 29.2.1, build a5c7197

> docker compose version
Docker Compose version v5.0.2

> docker run --rm hello-world

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
1. The Docker client contacted the Docker daemon.
2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
   (amd64)
3. The Docker daemon created a new container from that image which runs the
   executable that produces the output you are currently reading.
4. The Docker daemon streamed that output to the Docker client, which sent it
   to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
$ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
https://hub.docker.com/

For more examples and ideas, visit:
https://docs.docker.com/get-started/

> docker compose run --rm npm npm -v
11.11.0

> docker compose run --rm npm node --version
v25.8.0