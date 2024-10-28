-- Visitante
INSERT INTO visitante (correo) VALUES 
('visitante1@gmail.com'),
('visitante2@gmail.com');

-- Pais
INSERT INTO pais (nombre) VALUES 
('Argentina'),
('Brasil'),
('Chile'),
('Colombia'),
('México');

-- Escultor
INSERT INTO escultor (nombre, pais_id, correo, foto, bibliografia) VALUES 
('Juan Pérez', 1, 'juan.perez1@gmail.com', NULL, 'Biografía de Juan Pérez, escultor argentino.'),
('Ana Silva', 2, 'ana.silva1@gmail.com', NULL, 'Biografía de Ana Silva, escultora brasileña.'),
('Miguel Torres', 3, 'miguel.torres1@gmail.com', NULL, 'Biografía de Miguel Torres, escultor chileno.'),
('Sofía Rodríguez', 4, 'sofia.rodriguez1@gmail.com', NULL, 'Biografía de Sofía Rodríguez, escultora colombiana.'),
('Luis Gómez', 5, 'luis.gomez1@gmail.com', NULL, 'Biografía de Luis Gómez, escultor mexicano.');

-- Generar automáticamente 100 escultores
INSERT INTO escultor (nombre, pais_id, correo, foto, bibliografia) 
SELECT 
    CONCAT('Escultor ', n), 
    (n % 5) + 1, 
    CONCAT('escultor', n, '@gmail.com'), 
    NULL, 
    CONCAT('Biografía de Escultor ', n) 
FROM 
    (SELECT * FROM generate_series(6, 105) AS n) AS temp_series;

-- Escultura
-- Generar 100 esculturas con escultores asignados secuencialmente
INSERT INTO escultura (escultor_id, nombre, descripcion, fecha_creacion, qr) 
SELECT 
    n, 
    CONCAT('Escultura ', n), 
    CONCAT('Descripción de Escultura ', n), 
    DATE('2020-01-01', ('1 day' * n)), 
    NULL 
FROM 
    (SELECT * FROM generate_series(1, 100) AS n) AS temp_series;

-- Imagen
INSERT INTO imagen (fecha, imagen, descripcion) VALUES 
('2022-07-10', NULL, 'Imagen de ejemplo para Escultura 1'),
('2023-01-12', NULL, 'Imagen de ejemplo para Escultura 2');

-- Tematica
INSERT INTO tematica (nombre, descripcion) VALUES 
('Histórica', 'Obras históricas de varias épocas.'),
('Moderna', 'Esculturas de estilo moderno.');

-- Lugar
INSERT INTO lugar (nombre, descripcion) VALUES 
('Museo Nacional de Arte', 'Museo con una gran colección de arte.'),
('Centro Cultural', 'Centro de eventos culturales y exposiciones.');

-- Evento
INSERT INTO evento (nombre, lugar_id, fecha_inicio, fecha_fin, descripcion, tematica_id) VALUES 
('Bienal de Escultura', 1, '2024-10-01', '2024-10-15', 'Evento anual de esculturas.', 1),
('Feria de Arte Moderno', 2, '2024-11-05', '2024-11-20', 'Exposición de arte moderno.', 2);

-- EsculturaImagen (relación entre Escultura e Imagen)
INSERT INTO esculturaimagen (escultura_id, imagen_id) VALUES 
(1, 1),
(2, 2);

-- EscultorEvento (relación entre Escultor y Evento)
INSERT INTO escultorevento (escultor_id, evento_id) VALUES 
(1, 1),
(2, 2);

-- VotoEscultura (votos para Esculturas)
INSERT INTO votoescultura (escultura_id, visitante_id) VALUES 
(1, 1),
(2, 2);

-- VotoEscultor (votos para Escultores)
INSERT INTO votoescultor (escultor_id, visitante_id) VALUES 
(1, 1),
(2, 2);
