--
-- PostgreSQL database dump
--

\restrict 1aSPy1jG22PWeKxEvZYkHgpuURkpEQOrMBtD7fO8wcfy7h1EgAJLrbbCIj3ZGf3

-- Dumped from database version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)
-- Dumped by pg_dump version 18.3 (Ubuntu 18.3-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: curren
--

CREATE TABLE public.users (
    username integer,
    email character varying(50),
    password character varying(50),
    userid integer NOT NULL
);


ALTER TABLE public.users OWNER TO curren;

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: curren
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- PostgreSQL database dump complete
--

\unrestrict 1aSPy1jG22PWeKxEvZYkHgpuURkpEQOrMBtD7fO8wcfy7h1EgAJLrbbCIj3ZGf3

