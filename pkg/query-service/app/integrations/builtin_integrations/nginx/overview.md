### Monitor Nginx with Argus

This integration parses Nginx **combined** access logs and error logs, then ships a Grafana-style **customer HTTP dashboard**:

| Section | Panels (Grafana Loki Nginx analogue) |
|---------|--------------------------------------|
| KPIs | Total requests, HTTP 200 / 301 / 304, bytes sent, unique visitors |
| Errors | HTTP 404 / 413 / 500, all 5xx, Googlebot volume |
| Traffic | Status over time, status mix pie, bytes over time, method mix |
| Acquisition | Top pages, referrers, user agents, visitor IPs |
| Live | Recent request list (method, path, status, bytes, client) |

Enable the integration, point the collector at your access/error logs (see Collect Logs), then open **Nginx customer overview** from the integration assets.

**Not in default combined logs** (Grafana has these; Argus cannot invent them):

- World map / country — needs GeoIP on `$remote_addr`
- p95 request time — add `$request_time` to `log_format` and extend the parser
