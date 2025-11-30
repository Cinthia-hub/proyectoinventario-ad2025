-- BASE DE DATOS EXPORTADA DE FIREBASE (NoSQL) A SQL
-- Fecha: 2025-11-30T18:27:01.609Z
-- Proyecto: Mercadito POS

CREATE DATABASE IF NOT EXISTS mercadito_db;
USE mercadito_db;


-- Estructura de tabla para la tabla 'users'
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255),
  username VARCHAR(100),
  password VARCHAR(255),
  rol VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(20),
  direccion TEXT,
  photo_url TEXT
);

-- Volcando datos para la tabla 'users'
INSERT INTO users (id, nombre, username, password, rol, email, telefono, direccion, photo_url) VALUES 
('0iWlGSFJzd5DvuV510VU', 'diego', 'diegogzl', '$2b$10$oRCVLuZWbNW6TAdQt6fdMOtL4..ove8gxdauVDAcBArGBYmrKkLjq', 'admin', 'sergio@gmail.com', '4626024886', 'Casa de Cristo', 'https://i.pinimg.com/236x/0b/15/e8/0b15e84cf44c886f0ba0b7c35168e4c9.jpg'),
('YK5iTCqL110DgvG92Ht4', 'Sergio', 'sergio', '$2b$10$oZgmg14G//VTeSMlmFgkK.PbtyW.JGsPWAfh8n/VlRXmTEOlMbQjm', 'admin', 'sergio@gmail.com', '4626024886', 'Casa de Cristo', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLGSpuDHOvYF5bsBohZoIvZAh2rUnjMNRgRwzIpWyvQAP2dxfpjLhT0tus_rJBDzayxNM&usqp=CAU'),
('cUp0fKgAQiZznzyefjVJ', 'Kuko', 'admin', '$2b$10$EPiYC0QDciWGxND04u9z5uCCM1l03485HvBlslfYrlue4jJpG76Si', 'admin', 'kuko@gmail.com', '4626024886', 'Casa del Señor Dios', 'https://img.freepik.com/vector-premium/ilustracion-plana-hombres-que-llevan-chaqueta-combinacion-colores-marron-negro_981536-1552.jpg?semt=ais_hybrid&w=740&q=80');


-- Estructura de tabla para la tabla 'products'
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255),
  price DECIMAL(10,2),
  quantity INT,
  category VARCHAR(100),
  expiry_date DATE,
  availability VARCHAR(50),
  threshold_value INT
);

-- Volcando datos para la tabla 'products'
INSERT INTO products (id, nombre, price, quantity, category, expiry_date, availability, threshold_value) VALUES 
('OTRWqC9ICr10oOcyVbw7', 'Pizza', 45, 41, 'Congelados', '2025-12-02', 'In-stock', 4),
('a4Q3fo1ufmxKGZwnRz8X', 'Rare Beaty', 100, 99, 'Makeup', '2026-03-12', 'In-stock', 7),
('dEMPgS31Q8nU5bVaZgm5', 'Coca Cola 600ml', 18, 50, 'Bebidas', '2025-12-31', 'In Stock', 10),
('fLalM7RtX8Qo0HEnBt7t', 'Sephora', 55, 55, 'Makeup', '2025-12-25', 'In-stock', 1),
('hah9HNV23NOsCDw7LazX', 'Maggi', 2, 1, 'Salsa', '2026-01-23', 'Low stock', 2);


-- Estructura de tabla para la tabla 'suppliers'
DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  contact VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  photo_url TEXT
);

-- Volcando datos para la tabla 'suppliers'
INSERT INTO suppliers (id, name, contact, email, phone, address, photo_url) VALUES 
('CtNU2AmncLXd0rEG1iUd', 'Miguel', 'El Remate', 'remamiguel@ugto.mx', '4626024886', 'Circuito Circuitado', 'https://img.freepik.com/foto-gratis/joven-hombre-barbudo-camisa-rayas_273609-5677.jpg?semt=ais_hybrid&w=740&q=80'),
('DDCCXMZAkc65K5gwfwwE', 'Doña Chema', 'La Comer', 'chema@ugto.mx', '4626024886', 'Circuito Laurel', 'https://img.freepik.com/foto-gratis/estilo-vida-emociones-gente-concepto-casual-confiado-agradable-sonriente-mujer-asiatica-brazos-cruzados-pecho-seguro-listo-ayudar-escuchando-companeros-trabajo-participando-conversacion_1258-59335.jpg?semt=ais_hybrid&w=740&q=80'),
('O9TCjkvKOK7ojjGFEBbe', 'Consuelo Dubal', 'Aurrera', 'consuelo@ugto.mx', '4626027777', 'Pueblo Nuevo', 'https://images.chicmagazine.com.mx/1zn8oxXNqCAue7nIgWq2EYFcYNM=/512x319/uploads/media/2021/09/06/consuelo-duval-look-diseno-mexicano.jpg'),
('h64CCIKcxsHyaEr62ClW', 'Don Paco Hernandez', 'La Comercial Mexicana', 'paco@ugto.mx', '4626024886', 'Circuito Nube', 'https://media.istockphoto.com/id/1090878494/es/foto/retrato-de-joven-sonriente.jpg');


-- Estructura de tabla para la tabla 'stores'
DROP TABLE IF EXISTS stores;
CREATE TABLE stores (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255),
  manager VARCHAR(255),
  phone VARCHAR(20),
  notes TEXT,
  photo_url TEXT
);

-- Volcando datos para la tabla 'stores'
INSERT INTO stores (id, name, manager, phone, notes, photo_url) VALUES 
('0ozEM7Uk1iBMCJJDxDFG', 'Soriana', 'Nuevo Gerente', '1234567890', 'Horario extendido por temporada', 'https://upload.wikimedia.org/wikipedia/commons/2/23/Soriana_S%C3%BAper.JPG'),
('YyHZmIA4KLmg2HHIr36R', 'Soriana', 'Ejemplin Sanchez', '0987654321', 'Es muy economica', 'https://upload.wikimedia.org/wikipedia/commons/2/23/Soriana_S%C3%BAper.JPG'),
('lK31JTS5Ajf6UactBCnl', 'Soriana', 'Ejemplin Sanchez', '0987654321', 'Es muy economica', 'https://upload.wikimedia.org/wikipedia/commons/2/23/Soriana_S%C3%BAper.JPG');

