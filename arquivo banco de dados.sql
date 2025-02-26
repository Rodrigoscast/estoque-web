CREATE TABLE usuarios(
  cod_user SERIAL,
  nome VARCHAR(300),
  email VARCHAR(400),
  senha VARCHAR(400),
  CONSTRAINT pk_cod_user PRIMARY KEY (cod_user)
);

CREATE TABLE projeto(
  cod_projeto SERIAL,
  nome VARCHAR(300),
  pecas_totais INT,
  pecas_atuais INT,
  imagem VARCHAR(500),
  data_entrada DATE,
  CONSTRAINT pk_cod_projeto PRIMARY KEY(cod_projeto)
);

CREATE TABLE pecas(
  cod_peca SERIAL,
  nome VARCHAR(300),
  imagem VARCHAR(500),
  quantidade INT,
  valor FLOAT,
  CONSTRAINT pk_cod_peca PRIMARY KEY(cod_peca)
);

CREATE TABLE peca_projeto(
  cod_projeto INT,
  cod_peca INT,
  quantidade INT,
  CONSTRAINT pk_cod_projeto_cod_peca PRIMARY KEY (cod_projeto, cod_peca),
  CONSTRAINT fk_cod_projeto FOREIGN KEY (cod_projeto) REFERENCES projeto(cod_projeto),
  CONSTRAINT fk_cod_peca FOREIGN KEY (cod_peca) REFERENCES pecas(cod_peca)
);

CREATE TABLE pegou_peca(
  cod_pegou_peca SERIAL,
  cod_user INT,
  cod_projeto INT,
  cod_peca INT,
  quantidade INT,
  data_pegou TIMESTAMP,
  CONSTRAINT pk_cod_pegou_peca PRIMARY KEY (cod_pegou_peca),
  CONSTRAINT fk_cod_user FOREIGN KEY (cod_user) REFERENCES usuarios(cod_user),
  CONSTRAINT fk_cod_projeto FOREIGN KEY (cod_projeto) REFERENCES projeto(cod_projeto),
  CONSTRAINT fk_cod_peca FOREIGN KEY (cod_peca) REFERENCES pecas(cod_peca)
);

INSERT INTO projeto (nome, pecas_totais, pecas_atuais, imagem, data_entrada) VALUES ('Maquina que faz chover', 544, 431, 'imagemnova.png', CURRENT_DATE);
INSERT INTO projeto (nome, pecas_totais, pecas_atuais, imagem, data_entrada) VALUES ('Maquina que explode montanhas', 123, 35, '', CURRENT_DATE);
INSERT INTO projeto (nome, pecas_totais, pecas_atuais, imagem, data_entrada) VALUES ('Maquina que destrói planetas', 789, 200, 'imagemnova.png', CURRENT_DATE);
INSERT INTO projeto (nome, pecas_totais, pecas_atuais, imagem, data_entrada) VALUES ('Estrela da morte', 45, 2, '', CURRENT_DATE);

DROP TABLE pegou_peca;

INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (2, 2, 3, 10, '2025-02-24 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (2, 2, 2, 14, '2025-02-24 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (2, 2, 3, 32, '2025-02-23 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (3, 2, 4, 12, '2025-02-22 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (3, 2, 5, 10, '2025-02-21 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (3, 2, 6, 2, '2025-02-20 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (3, 2, 6, 1, '2025-02-21 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (3, 2, 6, 7, '2025-02-20 14:58:27.026704');
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (3, 2, 6, 10, '2025-02-19 14:58:27.026704');

INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (1, 2, 4, 1, CURRENT_TIMESTAMP);
INSERT INTO pegou_peca (cod_user, cod_projeto, cod_peca, quantidade, data_pegou) VALUES (1, 2, 7, 1, CURRENT_TIMESTAMP);

DELETE FROM pegou_peca;

INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Parafuso 8', '', 300, 0.5);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Parafuso 1', '', 200, 1.5);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Parafuso 12', '', 300, 2);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Placa de metal', '', 100, 5.5);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Porca 4', '', 680, 1.5);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Prego 3', '', 10, 2.3);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('prego 8', '', 30, 1.8);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Parafuso 45', '', 65, 5);
INSERT INTO pecas (nome, imagem, quantidade, valor) VALUES ('Parafuso 3', '', 213, 0.2);

SELECT * FROM usuarios;
SELECT * FROM projeto;
SELECT * FROM pecas;

SELECT 
	p.cod_peca,
	pc.nome,
	SUM(p.quantidade) as quantidade
FROM pegou_peca p
JOIN pecas pc ON p.cod_peca = pc.cod_peca
WHERE p.cod_projeto = 2
GROUP BY p.cod_peca, pc.nome;

SELECT 
	pp.cod_peca,
	pc.nome,
	GREATEST(pp.quantidade - COALESCE(SUM(p.quantidade), 0), 0) AS faltam
FROM peca_projeto pp
JOIN pecas pc ON pp.cod_peca = pc.cod_peca
LEFT JOIN pegou_peca p ON p.cod_projeto = pp.cod_projeto 
  	AND p.cod_peca = pp.cod_peca
WHERE pp.cod_projeto = 2
GROUP BY pp.cod_peca, pc.nome, pp.quantidade
ORDER BY pc.nome;

SELECT 
	p.cod_pegou_peca, 
	u.nome AS usuario,
	pc.nome AS peca,
	p.quantidade,
	p.data_pegou
FROM pegou_peca p
JOIN usuarios u ON p.cod_user = u.cod_user
JOIN pecas pc ON p.cod_peca = pc.cod_peca
WHERE p.cod_projeto = 2
ORDER BY p.data_pegou DESC;

SELECT * FROM pegou_peca;

SELECT * FROM peca_projeto;

SELECT * FROM pegou_peca WHERE data_pegou::date = '2023-06-18';

INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 10, 30);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 2, 10);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 3, 5);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 4, 35);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 5, 12);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 6, 46);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 7, 23);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 8, 65);
INSERT INTO peca_projeto (cod_projeto, cod_peca, quantidade) VALUES (2, 9, 12);


ALTER TABLE usuarios
ADD COLUMN ativado boolean;

ALTER TABLE usuarios 
ALTER COLUMN ativado SET DEFAULT TRUE;

UPDATE usuarios 
SET ativado = TRUE 
WHERE ativado IS NULL;

ALTER TABLE usuarios 
ALTER COLUMN ativado SET NOT NULL;