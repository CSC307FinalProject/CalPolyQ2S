


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."catalogs" (
    "catalog_id" integer NOT NULL,
    "catalog_type" character varying(10) NOT NULL,
    CONSTRAINT "catalogs_catalog_type_check" CHECK ((("catalog_type")::"text" = ANY ((ARRAY['quarter'::character varying, 'semester'::character varying])::"text"[])))
);


ALTER TABLE "public"."catalogs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_mappings" (
    "mapping_id" integer NOT NULL,
    "quarter_course_id" integer NOT NULL,
    "semester_course_id" integer NOT NULL
);


ALTER TABLE "public"."course_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "course_id" integer NOT NULL,
    "catalog_id" integer NOT NULL,
    "subject" character varying(10) NOT NULL,
    "course_number" character varying(10) NOT NULL,
    "class_name" character varying(100),
    "is_gen_ed" boolean DEFAULT false,
    "gen_ed_type" character varying(50),
    "is_tech_elective" boolean DEFAULT false,
    "tech_elective_type" character varying(50),
    "required_for_concentration" character varying(50)
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."majors" (
    "major_id" integer NOT NULL,
    "major_code" character varying(10) NOT NULL,
    "major_name" character varying(100) NOT NULL
);


ALTER TABLE "public"."majors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."requirement_group_courses" (
    "group_id" integer NOT NULL,
    "course_id" integer NOT NULL
);


ALTER TABLE "public"."requirement_group_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."requirement_groups" (
    "group_id" integer NOT NULL,
    "major_id" integer NOT NULL,
    "catalog_id" integer NOT NULL,
    "group_name" character varying(100) NOT NULL,
    "required_count" integer DEFAULT 1 NOT NULL,
    "concentration" character varying(50),
    CONSTRAINT "requirement_groups_required_count_check" CHECK (("required_count" > 0))
);


ALTER TABLE "public"."requirement_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_courses" (
    "student_id" integer NOT NULL,
    "course_id" integer NOT NULL
);


ALTER TABLE "public"."student_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "student_id" integer NOT NULL,
    "name" character varying(50) NOT NULL,
    "email" character varying(50) NOT NULL,
    "password_hash" character varying(256) NOT NULL,
    "year" integer,
    "major_id" integer NOT NULL,
    "concentration" character varying(50),
    "email_verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."students" OWNER TO "postgres";


ALTER TABLE ONLY "public"."catalogs"
    ADD CONSTRAINT "catalogs_pkey" PRIMARY KEY ("catalog_id");



ALTER TABLE ONLY "public"."course_mappings"
    ADD CONSTRAINT "course_mappings_pkey" PRIMARY KEY ("mapping_id");



ALTER TABLE ONLY "public"."course_mappings"
    ADD CONSTRAINT "course_mappings_quarter_course_id_semester_course_id_key" UNIQUE ("quarter_course_id", "semester_course_id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_catalog_id_subject_course_number_key" UNIQUE ("catalog_id", "subject", "course_number");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id");



ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_major_code_key" UNIQUE ("major_code");



ALTER TABLE ONLY "public"."majors"
    ADD CONSTRAINT "majors_pkey" PRIMARY KEY ("major_id");



ALTER TABLE ONLY "public"."requirement_group_courses"
    ADD CONSTRAINT "requirement_group_courses_pkey" PRIMARY KEY ("group_id", "course_id");



ALTER TABLE ONLY "public"."requirement_groups"
    ADD CONSTRAINT "requirement_groups_pkey" PRIMARY KEY ("group_id");



ALTER TABLE ONLY "public"."student_courses"
    ADD CONSTRAINT "student_courses_pkey" PRIMARY KEY ("student_id", "course_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_pkey" PRIMARY KEY ("student_id");



ALTER TABLE ONLY "public"."course_mappings"
    ADD CONSTRAINT "course_mappings_quarter_course_id_fkey" FOREIGN KEY ("quarter_course_id") REFERENCES "public"."courses"("course_id");



ALTER TABLE ONLY "public"."course_mappings"
    ADD CONSTRAINT "course_mappings_semester_course_id_fkey" FOREIGN KEY ("semester_course_id") REFERENCES "public"."courses"("course_id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalogs"("catalog_id");



ALTER TABLE ONLY "public"."requirement_group_courses"
    ADD CONSTRAINT "requirement_group_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id");



ALTER TABLE ONLY "public"."requirement_group_courses"
    ADD CONSTRAINT "requirement_group_courses_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."requirement_groups"("group_id");



ALTER TABLE ONLY "public"."requirement_groups"
    ADD CONSTRAINT "requirement_groups_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalogs"("catalog_id");



ALTER TABLE ONLY "public"."requirement_groups"
    ADD CONSTRAINT "requirement_groups_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("major_id");



ALTER TABLE ONLY "public"."student_courses"
    ADD CONSTRAINT "student_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id");



ALTER TABLE ONLY "public"."student_courses"
    ADD CONSTRAINT "student_courses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "public"."majors"("major_id");



ALTER TABLE "public"."catalogs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."majors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."requirement_group_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."requirement_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."catalogs" TO "anon";
GRANT ALL ON TABLE "public"."catalogs" TO "authenticated";
GRANT ALL ON TABLE "public"."catalogs" TO "service_role";



GRANT ALL ON TABLE "public"."course_mappings" TO "anon";
GRANT ALL ON TABLE "public"."course_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."course_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."majors" TO "anon";
GRANT ALL ON TABLE "public"."majors" TO "authenticated";
GRANT ALL ON TABLE "public"."majors" TO "service_role";



GRANT ALL ON TABLE "public"."requirement_group_courses" TO "anon";
GRANT ALL ON TABLE "public"."requirement_group_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."requirement_group_courses" TO "service_role";



GRANT ALL ON TABLE "public"."requirement_groups" TO "anon";
GRANT ALL ON TABLE "public"."requirement_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."requirement_groups" TO "service_role";



GRANT ALL ON TABLE "public"."student_courses" TO "anon";
GRANT ALL ON TABLE "public"."student_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."student_courses" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







