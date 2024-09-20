# https://docs.gunicorn.org/en/stable/settings.html#settings
from gunicorn import glogging

bind = "0.0.0.0:8000"
# workers = multiprocessing.cpu_count() * 2 + 1
workers = 4
accesslog = "-"
errorlog = "-"
timeout = 30
daemon = False

# https://docs.gunicorn.org/en/stable/settings.html#access-log-format
# t: fecha, h: dirección remota, r: status line, s: status, b: largo de la respuesta
# L: tiempo de respuesta en segundos, f: referrer, a: user agent
access_log_format = '{"timestamp": "%(t)s", "remote_addr": "%(h)s", "request": "%(r)s", "status": "%(s)s", "bytes": "%(b)s", "latency": "%(L)s", "referer": "%(f)s", "user_agent": "%(a)s" }'
loglevel = "info"

limit_request_line = 4094


class JSONLogger(glogging.Logger):
    def setup(self, cfg):
        super().setup(cfg)

        json_formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s %(filename)s"
        )
        for handler in self.access_log.handlers:
            handler.setFormatter(json_formatter)

        for handler in self.error_log.handlers:
            handler.setFormatter(json_formatter)

logger_class = JSONLogger
