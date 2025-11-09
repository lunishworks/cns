# Setup

```bash
docker build -t cns-home .
```


```bash
docker run -d -p 3000:3000 --restart --unless-stopped --name cns-home cns-home
```
