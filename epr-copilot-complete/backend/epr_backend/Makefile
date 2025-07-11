.PHONY: install lint type-check test format all

install:
	poetry install

lint:
	poetry run ruff check .

lint-fix:
	poetry run ruff check . --fix

type-check:
	poetry run mypy .

test:
	poetry run pytest

format:
	poetry run ruff format .

all: lint type-check test

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
