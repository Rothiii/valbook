# Product Requirement Document (PRD)

# Collaborative Asset Workspace Platform

Version: 0.1
Status: Draft
Type: General Product Documentation

---

# 1. Overview

Collaborative Asset Workspace Platform adalah aplikasi berbasis workspace untuk membantu pengguna mencatat, mengelola, memvisualisasikan, dan membagikan data aset secara fleksibel dan kolaboratif.

Sistem ini dirancang agar dapat digunakan untuk berbagai kebutuhan seperti:

* Personal wealth tracking
* Family asset management
* Company asset registry
* Small business asset tracking
* Portfolio monitoring
* Lightweight ERP asset module

Platform berfokus pada fleksibilitas data aset, visualisasi nilai aset, histori valuasi, serta sistem kolaborasi mirip Google Docs atau Notion.

---

# 2. Product Vision

Membuat platform asset management yang:

* sederhana digunakan,
* fleksibel untuk berbagai jenis aset,
* collaborative,
* scalable untuk pengembangan jangka panjang,
* dan tetap ringan tanpa kompleksitas ERP penuh.

---

# 3. Core Concept

## 3.1 Workspace-Based System

Semua data berada di dalam workspace.

Contoh workspace:

* Asset Keluarga
* Asset Perusahaan
* Personal Investment
* Property Management

Workspace menjadi ruang kolaborasi utama untuk:

* anggota,
* aset,
* kategori,
* owner label,
* dashboard,
* dan sharing.

---

## 3.2 Collaborative Access

Workspace dapat:

* mengundang member melalui email,
* dibagikan melalui public link,
* memiliki permission berbeda untuk tiap member.

Role awal:

* Owner
* Editor
* Viewer

---

## 3.3 Flexible Asset Structure

Aplikasi tidak hanya fokus pada aset digital atau hardware, tetapi mendukung berbagai jenis aset seperti:

* Laptop
* Rumah
* Tanah
* Kendaraan
* Emas
* Saham
* Crypto
* Tabungan
* Mesin
* Furniture
* Koleksi
* dan aset custom lainnya

---

# 4. Product Goals

## Primary Goals

* Menyediakan pencatatan aset yang fleksibel
* Memvisualisasikan perkembangan nilai aset
* Mendukung collaborative workspace
* Mendukung berbagai tipe aset tanpa perubahan struktur besar
* Menjadi fondasi untuk pengembangan sistem yang lebih besar di masa depan

---

## Secondary Goals

* Menjadi lightweight financial visibility tool
* Menjadi dokumentasi aset terpusat
* Menjadi sistem inventory sederhana
* Menjadi fondasi ERP asset module

---

# 5. Key Features

---

# 5.1 Authentication

Pengguna dapat:

* register,
* login,
* logout,
* menerima invitation workspace.

---

# 5.2 Workspace Management

Pengguna dapat:

* membuat workspace,
* mengelola member,
* mengatur sharing,
* berpindah workspace.

---

# 5.3 Asset Management

Asset memiliki data dasar seperti:

* nama aset,
* kode/serial,
* kategori,
* owner,
* harga beli,
* nilai sekarang,
* mata uang,
* status,
* lokasi,
* catatan.

Asset dapat:

* memiliki sub-asset,
* memiliki attachment,
* memiliki histori valuasi,
* memiliki histori transaksi sederhana,
* memiliki tags,
* memiliki activity log.

---

# 5.4 Dynamic Category System

Setiap workspace dapat:

* membuat kategori sendiri,
* membuat custom field sendiri untuk kategori tersebut.

Contoh:

* kategori Laptop memiliki field Chip dan RAM,
* kategori Tanah memiliki field Sertifikat dan Luas Tanah.

---

# 5.5 Asset Valuation History

Pengguna dapat menyimpan histori perubahan nilai aset.

Tujuan:

* visualisasi growth,
* histori depresiasi,
* monitoring perkembangan aset.

---

# 5.6 Dashboard & Visualisation

Dashboard menampilkan:

* total nilai aset,
* distribusi kategori,
* distribusi owner,
* growth asset,
* histori valuasi,
* recent activity.

---

# 5.7 Attachment Management

Asset dapat memiliki:

* foto,
* invoice,
* dokumen,
* sertifikat,
* file tambahan lainnya.

---

# 5.8 Activity Logs

Sistem mencatat aktivitas penting seperti:

* membuat aset,
* mengubah valuasi,
* upload file,
* edit kategori,
* archive asset.

---

# 5.9 Search & Filtering

Pengguna dapat:

* mencari aset,
* memfilter berdasarkan kategori,
* owner,
* status,
* tags,
* value range,
* dan parameter lainnya.

---

# 6. Asset Hierarchy

Aset mendukung struktur parent-child.

Contoh:

Rumah

* CCTV
* AC
* Furniture

Portfolio

* Bitcoin
* Ethereum

Tujuan:

* grouping,
* struktur aset,
* visualisasi kepemilikan.

---

# 7. Sharing System

Workspace dapat:

* diundang melalui email,
* dibagikan menggunakan link publik.

Public sharing awal hanya mendukung:

* view only access.

---

# 8. Non Goals (Not Included Yet)

Fitur berikut belum menjadi prioritas tahap awal:

* realtime collaboration
* auto sync market price
* accounting ledger
* advanced finance module
* AI insights
* automated depreciation engine
* public marketplace
* complex approval workflow

---

# 9. Long-Term Expansion Possibilities

Platform dirancang agar dapat berkembang menjadi:

* Personal Wealth Tracker
* Family Office Management
* Business Asset Registry
* Inventory Management System
* ERP Asset Module
* Portfolio Management Platform

---

# 10. Product Philosophy

Produk harus:

* fleksibel,
* modular,
* collaborative,
* visual,
* dan mudah dikembangkan.

Sistem tidak boleh terlalu rigid seperti ERP tradisional, namun juga tidak terlalu bebas hingga data menjadi tidak konsisten.

---

# 11. Initial Technical Direction (High-Level)

Stack awal yang dipertimbangkan:

* TypeScript
* Next.js
* PostgreSQL
* Drizzle ORM
* Object Storage untuk attachment

Pendekatan database:

* hybrid static + dynamic schema.

---

# 12. Future Improvement & Refinement Stages

Tahap penyempurnaan berikutnya:

## 12.1 Entity Relationship / Database Design

Mendesain struktur database detail dan hubungan antar entity.

---

## 12.2 Feature Prioritisation (MVP vs V2)

Menentukan:

* fitur inti MVP,
* fitur enhancement,
* roadmap pengembangan.

---

## 12.3 UX Flow Design

Mendesain:

* navigation flow,
* onboarding,
* dashboard experience,
* asset detail experience,
* sharing flow.

---

## 12.4 API Design

Mendesain:

* endpoint structure,
* response format,
* validation strategy,
* scalability approach.

---

## 12.5 Permission Matrix

Mendefinisikan:

* role access,
* workspace permissions,
* sharing behaviour,
* public access rules.

---

# 13. Current Status

Project masih berada pada tahap:

* conceptual planning,
* product architecture discussion,
* early requirement gathering.

Dokumen ini menjadi fondasi awal untuk pengembangan PRD teknis dan implementasi berikutnya.
