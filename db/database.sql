CREATE DATABASE react_app;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(256),
    password VARCHAR(256),
    UNIQUE (email)
);

CREATE TABLE dogs(
    dog_id SERIAL PRIMARY KEY,
    breed VARCHAR(256),
    subBreed VARCHAR(256),
    imageUrl VARCHAR(256),
    custom BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

ALTER TABLE dogs ADD COLUMN picture bytea;
ALTER TABLE ONLY dogs ALTER COLUMN custom SET DEFAULT false;