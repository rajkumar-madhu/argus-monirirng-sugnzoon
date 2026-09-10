FROM alpine:3.20.3
LABEL org.opencontainers.image.title="Argus"
LABEL org.opencontainers.image.source="https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon"
WORKDIR /root

ARG OS="linux"
ARG TARGETARCH

RUN apk update && \
	apk add ca-certificates && \
	rm -rf /var/cache/apk/*


COPY ./target/${OS}-${TARGETARCH}/argus-community /root/argus
COPY ./templates /root/templates
COPY frontend/build/ /etc/argus/web/

RUN chmod 755 /root /root/argus

ENTRYPOINT ["./argus", "server"]
