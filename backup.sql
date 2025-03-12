--
-- PostgreSQL database dump
--

-- Dumped from database version 17.3
-- Dumped by pg_dump version 17.3

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

--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios (cod_user, nome, email, senha, ativado, site, app) VALUES (4, 'Amanda Alves de Souza', 'amandinha@gmail.com', '$2b$10$KHBSk4LBFdCkk.1IPKv8j.zw0HTJtsWhhWXJScNrxHMJ1bRMSrjJ2', false, false, false);
INSERT INTO public.usuarios (cod_user, nome, email, senha, ativado, site, app) VALUES (5, 'Teste1234', 'testando@gmail.com', '$2b$10$DMcsaDtZkwQ1r/qdtuEs0.51Vj6fHTUZoQh9O3RvU9EfXzjBHwYLi', false, false, false);
INSERT INTO public.usuarios (cod_user, nome, email, senha, ativado, site, app) VALUES (6, 'Teste', 'novoemail@gmail.com', '$2b$10$jqP0TYUIAYZTY2o7GzZ1jOAYtNHjsaLQTfEqzONadOxa0cJXMAyrK', true, false, false);
INSERT INTO public.usuarios (cod_user, nome, email, senha, ativado, site, app) VALUES (2, 'Eduardo Alberto Cintra', 'eduardo@gmail.com', '$2b$10$p9kgl0aVKJs/7PNdKAnay.4mgj8VswmvP3sqzmGZaonsLceUx5U7G', true, true, true);
INSERT INTO public.usuarios (cod_user, nome, email, senha, ativado, site, app) VALUES (3, 'Poucas Trancas', 'poucastrancas@gmail.com', '$2b$10$iNY/7.vabShnPHXj0e3p3OlM.V2KWz2xl9nQjo4CBeK.NXvpMREo.', true, true, true);
INSERT INTO public.usuarios (cod_user, nome, email, senha, ativado, site, app) VALUES (1, 'Rodrigo Silva Castro', 'rodrigo.kontato@gmail.com', '$2b$10$EwPYU4ucpC952/zG4pr0sukCQ2VGiOIiRUIWjrdILBymZu3antQfa', true, true, true);


--
-- Data for Name: PasswordResetTokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (11, 1, '6b0dc6ae878c8704e4f62c3784bb6cbc5beb0a579ba2cbe463d26e75bca92888', '2025-03-11 15:16:56.41-03', '2025-03-11 14:16:56.414-03', '2025-03-11 14:16:56.414-03');
INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (12, 1, '24c3c1f0fa9ca6ed43f52f8a0642124aa8b0ed608be28b30059aa5b24a8ad54a', '2025-03-11 15:17:19.854-03', '2025-03-11 14:17:19.856-03', '2025-03-11 14:17:19.856-03');
INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (13, 1, '378226f7cc21d5d117d4f145e99534b1a2abcacea6af6031a21135247958fda5', '2025-03-11 15:24:29.193-03', '2025-03-11 14:24:29.195-03', '2025-03-11 14:24:29.195-03');
INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (14, 1, '61f6d089d0582b4950e2e23e02f43a7414be86cbcd613b823a82d5ddd409c830', '2025-03-11 15:26:58.481-03', '2025-03-11 14:26:58.482-03', '2025-03-11 14:26:58.482-03');
INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (15, 1, 'f63244a415984e3674a5e94479c4286dcf7dd9dedbe520b0a6216fdf589a256a', '2025-03-11 15:27:39.233-03', '2025-03-11 14:27:39.234-03', '2025-03-11 14:27:39.234-03');
INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (16, 1, 'f5cad2eb7f95462f6e9c4d9a02b9406e13d4e25a3377d93dc9dca94f6d9c401a', '2025-03-11 15:28:27.354-03', '2025-03-11 14:28:27.356-03', '2025-03-11 14:28:27.356-03');
INSERT INTO public."PasswordResetTokens" (id, cod_user, token, expires, "createdAt", "updatedAt") VALUES (19, 1, '2e540d001bff78d7fe2a3f5bb7c842cdac3c90c01f6c9bb7b77a715888de08a3', '2025-03-12 17:51:45.853-03', '2025-03-12 16:51:45.854-03', '2025-03-12 16:51:45.854-03');


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categorias (cod_categoria, nome) VALUES (2, 'Item Comercial');
INSERT INTO public.categorias (cod_categoria, nome) VALUES (3, 'Usinagem');
INSERT INTO public.categorias (cod_categoria, nome) VALUES (4, 'Laser');
INSERT INTO public.categorias (cod_categoria, nome) VALUES (9, 'Peças Novas');
INSERT INTO public.categorias (cod_categoria, nome) VALUES (15, 'tester');


--
-- Data for Name: pecas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2433, 'CAPCLN-FI-002-B', 'pecas/20250307_153940_image39.png', 0, 0, 3);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2480, 'CAPCLN-EXI-001', 'pecas/20250307_153940_image86.png', 90, 4, 2);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2435, 'CAPCLN-FS-014-B', 'pecas/20250307_153940_image41.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2436, 'CAPCLN-FS-013-B', 'pecas/20250307_153940_image42.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2437, 'CAPCLN-FS-007-B', 'pecas/20250307_153940_image43.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2438, 'CAPCLN-FS-006-B', 'pecas/20250307_153940_image44.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2439, 'CAPCLN-FS-005-B', 'pecas/20250307_153940_image45.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2440, 'CAPCLN-FS-004-B', 'pecas/20250307_153940_image46.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2441, 'CAPCLN-FS-003-B', 'pecas/20250307_153940_image47.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2442, 'CAPCLN-FS-002-B', 'pecas/20250307_153940_image48.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2443, 'CAPCLN-FS-001-B', 'pecas/20250307_153940_image49.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2444, 'CAPJVI-FI-001-A', 'pecas/20250307_153940_image50.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2445, 'CAPJVI-FI-002-A', 'pecas/20250307_153940_image51.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2446, 'CAPJVI-FI-003-A', 'pecas/20250307_153940_image52.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2447, 'CAPJVI-FI-004-A', 'pecas/20250307_153940_image53.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2448, 'CAPJVI-FI-005-A', 'pecas/20250307_153940_image54.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2449, 'CAPJVI-FI-006-A', 'pecas/20250307_153940_image55.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2450, 'CAPJVI-FI-007-A', 'pecas/20250307_153940_image56.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2451, 'CAPJVI-FI-008-A', 'pecas/20250307_153940_image57.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2452, 'CAPJVI-FI-009-A', 'pecas/20250307_153940_image58.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2453, 'CAPJVI-FI-010-A', 'pecas/20250307_153940_image59.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2454, 'CAPJVI-FI-011-A', 'pecas/20250307_153940_image60.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2455, 'CAPJVI-FI-012-A', 'pecas/20250307_153940_image61.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2456, 'CAPJVI-FI-013-A', 'pecas/20250307_153940_image62.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2457, 'CAPJVI-FS-001-A', 'pecas/20250307_153940_image63.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2458, 'CAPJVI-FS-002-A', 'pecas/20250307_153940_image64.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2459, 'CAPJVI-FS-003-007-A', 'pecas/20250307_153940_image65.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2460, 'CAPJVI-FS-008-011', 'pecas/20250307_153940_image66.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2461, 'CAPJVI-FS-012', 'pecas/20250307_153940_image67.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2462, 'CAPJVI-FS-013-A', 'pecas/20250307_153940_image68.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2464, 'CAPJVI-FS-003-007-B', 'pecas/20250307_153940_image70.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2465, 'CAPJVI-FI-013-B', 'pecas/20250307_153940_image71.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2466, 'CAPJVI-FS-002-B', 'pecas/20250307_153940_image72.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2467, 'CAPJVI-FS-001-B', 'pecas/20250307_153940_image73.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2468, 'CAPJVI-FI-001-B', 'pecas/20250307_153940_image74.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2469, 'CAPJVI-FI-002-B', 'pecas/20250307_153940_image75.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2470, 'CAPJVI-FI-003-B', 'pecas/20250307_153940_image76.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2471, 'CAPJVI-FI-004-B', 'pecas/20250307_153940_image77.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2472, 'CAPJVI-FI-005-B', 'pecas/20250307_153940_image78.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2473, 'CAPJVI-FI-006-B', 'pecas/20250307_153940_image79.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2474, 'CAPJVI-FI-007-B', 'pecas/20250307_153940_image80.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2475, 'CAPJVI-FI-008-B', 'pecas/20250307_153940_image81.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2476, 'CAPJVI-FI-009-B', 'pecas/20250307_153940_image82.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2477, 'CAPJVI-FI-010-B', 'pecas/20250307_153940_image83.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2478, 'CAPJVI-FI-011-B', 'pecas/20250307_153940_image84.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2479, 'CAPJVI-FI-012-B', 'pecas/20250307_153940_image85.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2482, 'CAPCLN-SEP-10mm', 'pecas/20250307_153940_image88.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2483, 'CAPCLN-SEP-35,3mm', 'pecas/20250307_153940_image89.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2485, 'CAPCLN-SEP-40,3mm', 'pecas/20250307_153940_image91.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2487, 'CAPCLN-SEP-47,8mm', 'pecas/20250307_153940_image93.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2488, 'CAPCLN-SEP-40mm', 'pecas/20250307_153940_image94.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2489, 'CAPCLN-SEP-52,8mm', 'pecas/20250307_153940_image95.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2490, 'CAPCLN-SEP-47,5mm', 'pecas/20250307_153940_image96.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2491, 'CAPCLN-SEP-60,3mm', 'pecas/20250307_153940_image97.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2492, 'CAPCLN-SEP-55mm', 'pecas/20250307_153940_image98.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2493, 'CAPCLN-SEP-
157,15mm', 'pecas/20250307_153940_image99.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2494, 'CAPCLN-SEP-62,5mm', 'pecas/20250307_153940_image100.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2495, 'CAPCLN-SEP-80mm', 'pecas/20250307_153940_image101.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2496, 'CAPCLN-SEP-100mm', 'pecas/20250307_153940_image102.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2497, 'CAPCLN-SEP-
159,65mm', 'pecas/20250307_153940_image103.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2498, 'CAPCLN-SEP-
122,5mm', 'pecas/20250307_153940_image104.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2499, 'CAPCLN-SEP-179mm', 'pecas/20250307_153940_image105.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2500, 'CAPCLN-SEP-
132,5mm', 'pecas/20250307_153940_image106.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2501, 'CAPCLN-SEP-154mm', 'pecas/20250307_153940_image107.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2502, 'CAPCLN-SEP-20mm', 'pecas/20250307_153940_image108.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2503, 'CAPCLN-SEP-25mm', 'pecas/20250307_153940_image109.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2504, 'CAPCLN-SEP-
77,65mm', 'pecas/20250307_153940_image110.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2505, 'CAPCLN-SEP-37,5mm', 'pecas/20250307_153940_image111.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2506, 'CAPCLN-SEP-60mm', 'pecas/20250307_153940_image112.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2507, 'CAPCLN-SEP-85mm', 'pecas/20250307_153940_image113.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2508, 'CAPCLN-SEP-65mm', 'pecas/20250307_153940_image114.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2509, 'CAPCLN-SEP-76mm', 'pecas/20250307_153940_image115.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2510, 'CAPCLN-SEP-87,5mm', 'pecas/20250307_153940_image116.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2511, 'CAPCLN-SEP-98mm', 'pecas/20250307_153940_image117.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2512, 'CAPCLN-SEP-82,5mm', 'pecas/20250307_153940_image118.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2513, 'CAPCLN-SEP-114mm', 'pecas/20250307_153940_image119.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2514, 'CAPCLN-SEP-72,5mm', 'pecas/20250307_153940_image120.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2463, 'CAPJVI-FS-013-B', 'pecas/20250307_153940_image69.png', 46, 12, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2484, 'CAPCLN-SEP-15mm', 'pecas/20250307_153940_image90.png', 46, 12, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2434, 'CAPCLN-FI-001-B', 'pecas/20250307_153940_image40.png', 0, 0, 2);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2486, 'CAPCLN-SEP-27,5mm', 'pecas/20250307_153940_image92.png', 2, 1, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2481, 'CAPCLN-EXS-001', 'pecas/20250307_153940_image87.png', 4, 122, 4);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2515, 'CAPCLN-SEP-102mm', 'pecas/20250307_153940_image121.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2516, 'CAPCLN-SEP-99,5mm', 'pecas/20250307_153940_image122.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2517, 'CAPCLN-SEP-50mm', 'pecas/20250307_153940_image123.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2518, 'CAPCLN-SEP-32,5mm', 'pecas/20250307_153940_image124.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2403, 'CAPCLN-FI-009-A', 'pecas/20250307_153940_image9.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2404, 'CAPCLN-FI-010-A', 'pecas/20250307_153940_image10.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2405, 'CAPCLN-FI-011-A', 'pecas/20250307_153940_image11.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2406, 'CAPCLN-FI-012-A', 'pecas/20250307_153940_image12.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2407, 'CAPCLN-FI-013-A', 'pecas/20250307_153940_image13.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2408, 'CAPCLN-FS-001-A', 'pecas/20250307_153940_image14.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2409, 'CAPCLN-FS-002-A', 'pecas/20250307_153940_image15.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2410, 'CAPCLN-FS-003-A', 'pecas/20250307_153940_image16.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2411, 'CAPCLN-FS-004-A', 'pecas/20250307_153940_image17.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2412, 'CAPCLN-FS-005-A', 'pecas/20250307_153940_image18.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2413, 'CAPCLN-FS-006-A', 'pecas/20250307_153940_image19.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2414, 'CAPCLN-FS-007-A', 'pecas/20250307_153940_image20.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2415, 'CAPCLN-FS-008', 'pecas/20250307_153940_image21.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2416, 'CAPCLN-FS-009', 'pecas/20250307_153940_image22.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2417, 'CAPCLN-FS-010', 'pecas/20250307_153940_image23.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2418, 'CAPCLN-FS-011', 'pecas/20250307_153940_image24.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2419, 'CAPCLN-FS-012', 'pecas/20250307_153940_image25.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2420, 'CAPCLN-FS-013-A', 'pecas/20250307_153940_image26.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2421, 'CAPCLN-FS-014-A', 'pecas/20250307_153940_image27.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2422, 'CAPCLN-FI-013-B', 'pecas/20250307_153940_image28.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2423, 'CAPCLN-FI-012-B', 'pecas/20250307_153940_image29.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2424, 'CAPCLN-FI-011-B', 'pecas/20250307_153940_image30.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2425, 'CAPCLN-FI-010-B', 'pecas/20250307_153940_image31.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2426, 'CAPCLN-FI-009-B', 'pecas/20250307_153940_image32.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2429, 'CAPCLN-FI-006-B', 'pecas/20250307_153940_image35.png', 0, 0, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2402, 'CAPCLN-FI-008-A', 'pecas/20250307_153940_image8.png', 2, 2, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2428, 'CAPCLN-FI-007-B', 'pecas/20250307_153940_image34.png', 3, 3, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2427, 'CAPCLN-FI-008-B', 'pecas/20250307_153940_image33.png', 4, 4, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2401, 'CAPCLN-FI-007-A', 'pecas/20250307_153940_image7.png', 19, 23, NULL);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2395, 'CAPCLN-FI-001-A', 'pecas/20250307_153940_image1.png', 0, 0, 2);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2396, 'CAPCLN-FI-002-A', 'pecas/20250307_153940_image2.png', 0, 0, 4);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2397, 'CAPCLN-FI-003-A', 'pecas/20250307_153940_image3.png', 0, 0, 3);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2432, 'CAPCLN-FI-003-B', 'pecas/20250307_153940_image38.png', 0, 0, 15);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2398, 'CAPCLN-FI-004-A', 'pecas/20250307_153940_image4.png', 0, 0, 9);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2431, 'CAPCLN-FI-004-B', 'pecas/20250307_153940_image37.png', 1, 1, 4);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2399, 'CAPCLN-FI-005-A', 'pecas/20250307_153940_image5.png', 5, 4, 2);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2430, 'CAPCLN-FI-005-B', 'pecas/20250307_153940_image36.png', 0, 0, 4);
INSERT INTO public.pecas (cod_peca, nome, imagem, quantidade, valor, cod_categoria) VALUES (2400, 'CAPCLN-FI-006-A', 'pecas/20250307_153940_image6.png', 0, 0, 3);


--
-- Data for Name: historico_compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (22, 2480, 50, 10, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (23, 2401, 20, 23, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (24, 2484, 50, 12, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (25, 2463, 50, 12, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (26, 2481, 14, 122, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (27, 2431, 3, 1, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (28, 2399, 5, 4, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (29, 2402, 2, 2, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (30, 2428, 3, 3, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (31, 2427, 4, 4, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (32, 2486, 6, 1, '2025-03-10');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (33, 2480, 50, 4, '2025-02-12');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (34, 2480, 40, 6, '2025-01-12');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (35, 2480, 40, 2, '2025-01-12');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (36, 2480, 40, 5, '2024-12-12');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (37, 2480, 40, 8, '2024-11-12');
INSERT INTO public.historico_compras (cod_historico, cod_peca, quantidade, valor, data_compra) VALUES (38, 2480, 40, 10, '2024-10-12');


--
-- Data for Name: passwordresettokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: projeto; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (123, 'teste1.xlsx', 2, 0, '', '2025-03-07', false, true, 122, '2025-04-07');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (124, 'teste12.xlsx', 4, 0, '', '2025-03-07', false, true, 122, '2025-04-07');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (125, 'teste123.xlsx', 6, 0, '', '2025-03-07', false, true, 122, '2025-04-07');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (131, 'teste1234.xlsx', 8, 0, '', '2025-03-12', false, true, 127, '2025-04-12');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (122, 'final test', 280, 22, 'projetos/20250307_153942.PNG', '2025-03-07', false, true, 0, '2025-05-20');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (126, 'teste1234.xlsx', 8, 0, '', '2025-03-07', false, true, 122, '2025-04-07');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (127, 'final test', 280, 0, 'projetos/20250312_172103.PNG', '2025-03-12', false, true, 0, '2025-04-12');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (128, 'teste1.xlsx', 2, 0, '', '2025-03-12', false, true, 127, '2025-04-12');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (129, 'teste12.xlsx', 4, 0, '', '2025-03-12', false, true, 127, '2025-04-12');
INSERT INTO public.projeto (cod_projeto, nome, pecas_totais, pecas_atuais, imagem, data_entrada, concluido, ativo, projeto_main, data_entrega) VALUES (130, 'teste123.xlsx', 6, 0, '', '2025-03-12', false, true, 127, '2025-04-12');


--
-- Data for Name: peca_projeto; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2399, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2400, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2401, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2402, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2403, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2404, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2405, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2406, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2407, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2408, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2409, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2410, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2411, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2412, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2413, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2414, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2415, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2416, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2417, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2418, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2419, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2420, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2421, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2422, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2423, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2424, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2425, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2426, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2427, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2428, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2429, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2430, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2431, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2432, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2433, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2434, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2435, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2436, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2437, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2438, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2439, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2440, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2441, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2442, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2443, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2444, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2445, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2446, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2447, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2448, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2449, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2450, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2451, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2452, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2453, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2454, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2455, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2456, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2457, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2458, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2459, 5);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2460, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2461, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2462, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2463, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2464, 10);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2465, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2466, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2467, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2468, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2469, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2470, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2471, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2472, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2473, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2474, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2475, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2476, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2477, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2478, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2479, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2480, 14);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2481, 14);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2482, 5);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2483, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2484, 13);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2485, 6);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2486, 6);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2487, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2488, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2489, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2490, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2491, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2492, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2493, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2494, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2495, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2496, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2497, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2498, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2499, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2500, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2501, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2502, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2503, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2504, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2505, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2506, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2507, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2508, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2509, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2510, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2511, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2512, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2513, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2514, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2515, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2516, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2517, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (122, 2518, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (123, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (123, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (124, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (124, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (124, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (124, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (125, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (125, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (125, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (125, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (125, 2399, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (125, 2400, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2399, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2400, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2401, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (126, 2402, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2399, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2400, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2401, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2402, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2403, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2404, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2405, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2406, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2407, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2408, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2409, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2410, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2411, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2412, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2413, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2414, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2415, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2416, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2417, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2418, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2419, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2420, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2421, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2422, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2423, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2424, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2425, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2426, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2427, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2428, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2429, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2430, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2431, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2432, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2433, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2434, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2435, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2436, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2437, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2438, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2439, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2440, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2441, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2442, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2443, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2444, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2445, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2446, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2447, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2448, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2449, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2450, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2451, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2452, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2453, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2454, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2455, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2456, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2457, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2458, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2459, 5);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2460, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2461, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2462, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2463, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2464, 10);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2465, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2466, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2467, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2468, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2469, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2470, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2471, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2472, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2473, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2474, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2475, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2476, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2477, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2478, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2479, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2480, 14);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2481, 14);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2482, 5);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2483, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2484, 13);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2485, 6);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2486, 6);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2487, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2488, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2489, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2490, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2491, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2492, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2493, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2494, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2495, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2496, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2497, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2498, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2499, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2500, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2501, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2502, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2503, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2504, 4);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2505, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2506, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2507, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2508, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2509, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2510, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2511, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2512, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2513, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2514, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2515, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2516, 3);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2517, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (127, 2518, 2);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (128, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (128, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (129, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (129, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (129, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (129, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (130, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (130, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (130, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (130, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (130, 2399, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (130, 2400, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2395, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2396, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2397, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2398, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2399, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2400, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2401, 1);
INSERT INTO public.peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (131, 2402, 1);


--
-- Data for Name: pegou_peca; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pegou_peca (cod_pegou_peca, cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (136, 1, 122, 2480, 5, '2025-03-12 14:00:20.653');
INSERT INTO public.pegou_peca (cod_pegou_peca, cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (137, 1, 122, 2481, 7, '2025-03-12 14:00:26.837');
INSERT INTO public.pegou_peca (cod_pegou_peca, cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (138, 1, 122, 2480, 2, '2025-03-12 16:35:59.918');
INSERT INTO public.pegou_peca (cod_pegou_peca, cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (139, 1, 122, 2431, 2, '2025-03-12 17:05:56.502');
INSERT INTO public.pegou_peca (cod_pegou_peca, cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (140, 1, 122, 2480, 3, '2025-03-12 17:31:47.843');
INSERT INTO public.pegou_peca (cod_pegou_peca, cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (141, 1, 122, 2481, 3, '2025-03-12 17:31:47.843');


--
-- Name: PasswordResetTokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PasswordResetTokens_id_seq"', 19, true);


--
-- Name: categorias_cod_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_cod_categoria_seq', 16, true);


--
-- Name: historico_compras_cod_historico_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historico_compras_cod_historico_seq', 38, true);


--
-- Name: passwordresettokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.passwordresettokens_id_seq', 1, false);


--
-- Name: pecas_cod_peca_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pecas_cod_peca_seq', 2518, true);


--
-- Name: pegou_peca_cod_pegou_peca_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pegou_peca_cod_pegou_peca_seq', 141, true);


--
-- Name: projeto_cod_projeto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projeto_cod_projeto_seq', 131, true);


--
-- Name: usuarios_cod_user_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_cod_user_seq', 6, true);


--
-- PostgreSQL database dump complete
--

