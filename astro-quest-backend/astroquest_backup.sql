--
-- PostgreSQL database dump
--

\restrict 7avqmneXw3pv37M1iDJSh7QcmivU4FC7uxUe8UuHMwoGjOKtogi2UebhZg37kaM

-- Dumped from database version 15.15 (Homebrew)
-- Dumped by pg_dump version 15.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: ashishsingh
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ashishsingh;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: ashishsingh
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: User; Type: TABLE; Schema: public; Owner: ashishsingh
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    otp text,
    "otpExpiry" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO ashishsingh;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ashishsingh
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ashishsingh;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: ashishsingh
--

COPY public."User" (id, email, otp, "otpExpiry", "createdAt") FROM stdin;
a7b081e7-c30d-43d7-8f83-b22ab1eae73a	ashishsingh6304@gmail.com	\N	\N	2026-01-07 08:18:55.569
6d2acd46-70e8-47bb-9e66-4d7b60cc91e0	uttam@gmail.com	\N	\N	2026-01-07 08:23:37.552
c46be349-aa55-4b50-baba-c7a477d56d14	akshay@gmail.com	\N	\N	2026-01-07 14:57:53.496
fed2ebfd-9de6-4c04-93c5-c526c49df20e	8383828921	\N	\N	2026-01-07 14:58:50.313
4a5ce1c9-7de3-4802-964e-eec3b9fe3717	test@gmail.com	\N	\N	2026-01-08 06:55:30.194
15d4dd42-705e-4105-8aee-918c84d4f1ac	ashish@gmail.com	\N	\N	2026-01-07 08:53:19.177
213400bf-b4d2-4e4d-b981-ae667ea8cfd8	ashishsingh@gmail.com	638964	2026-01-08 14:18:01.645	2026-01-08 14:13:01.72
87d6236e-bb18-44a5-86b9-78a3b2f68ce3	akssingh@gmail.com	\N	\N	2026-01-08 14:21:39.531
7652c45b-7022-47c6-bb82-f3a1c1a1ddd4	xyz@gmail.com	\N	\N	2026-01-08 14:56:46.424
066195eb-c2e2-4b1f-ae09-4327350879fb	absjsj@gmail.com	\N	\N	2026-01-08 15:39:41.436
02dbdafb-f359-4032-a346-40e4fa30ed2e	abcd@gmail.com	\N	\N	2026-01-11 08:49:32.206
fbc40dcc-8a99-436b-909e-f5cebc691fb7	ashishji@gmail.com	\N	\N	2026-01-11 09:00:25.32
c7abce36-d9a1-41ab-86d9-1a0f0b958935	qwidodh@gmail.com	\N	\N	2026-01-11 09:27:53.284
5a80982a-c71b-48d1-a167-dbf7b1912bc4	sbsjbdj@gmail.com	\N	\N	2026-01-11 10:10:01.812
81754887-2a17-4877-a5df-6386a07a1d04	asfhjb@gmail.com	\N	\N	2026-01-11 10:14:55.101
bff439ad-2690-477d-bb5a-44871973ae46	ashishsingh5371@gmail.com	\N	\N	2026-01-11 07:37:52.47
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ashishsingh
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e406bc12-51ba-4f1d-bede-061fd4b1b62a	e081403a3c886e0ae75252cfc3c47669d6a9693a6324ce1a02a6de2a9635b22f	2026-01-07 13:48:01.361245+05:30	20260107081801_init	\N	\N	2026-01-07 13:48:01.354217+05:30	1
\.


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishsingh
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ashishsingh
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: ashishsingh
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: ashishsingh
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 7avqmneXw3pv37M1iDJSh7QcmivU4FC7uxUe8UuHMwoGjOKtogi2UebhZg37kaM

