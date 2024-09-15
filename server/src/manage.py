#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault("DJANGO_ENV", "dev")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

    env = os.getenv("DJANGO_ENV")

    if env != "prod" and env != "dev":
        print("DJANGO_ENV debe tener los valores `prod` o `dev`")
        exit(1)

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
