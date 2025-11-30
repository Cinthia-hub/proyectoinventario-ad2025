import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// GET /api/orders - lista todas las órdenes
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("orders").orderBy("created_at", "desc").get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
});

// META endpoints para poblar selects en frontend

// GET /api/orders/meta/products
router.get("/meta/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        nombre: d.nombre || d.name || "",
        unit: d.unit || d.unidad || d.unit || "",
        url: d.url || d.photo_url || d.image || ""
      };
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products meta:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/meta/suppliers
router.get("/meta/suppliers", async (req, res) => {
  try {
    const snapshot = await db.collection("suppliers").get();
    const suppliers = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name || d.nombre || "",
        photo_url: d.photo_url || d.url || d.image || ""
      };
    });
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers meta:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/meta/stores
router.get("/meta/stores", async (req, res) => {
  try {
    const snapshot = await db.collection("stores").get();
    const stores = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name || d.nombre || "",
        address: d.address || d.direccion || "",
        manager: d.manager || d.gerente || "",
        phone: d.phone || d.telefono || "",
        photo_url: (d.photo_url || d.url || d.image || "").toString()
      };
    });
    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores meta:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - crea una orden (guarda snapshots)
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    const {
      adminId,
      admin_name,
      supplierId,
      storeId,
      productId,
      quantity = 0,
      order_date,
      delivery_date,
      notes = ""
    } = payload;

    const orderDoc = {
      adminId: adminId || null,
      admin_name: admin_name || "unknown",
      supplierId: supplierId || null,
      supplier_name: "",
      supplier_image: "",
      storeId: storeId || null,
      store_name: "",
      store_image: "",
      store_address: "",
      store_manager: "",
      productId: productId || null,
      product_name: "",
      product_image: "",
      product_unit: "",
      quantity: Number(quantity) || 0,
      order_date: order_date || "",
      delivery_date: delivery_date || "",
      notes: notes || "",
      created_at: new Date().toISOString()
    };

    if (supplierId) {
      const sSnap = await db.collection("suppliers").doc(supplierId).get();
      if (sSnap.exists) {
        const s = sSnap.data();
        orderDoc.supplier_name = s.name || s.nombre || "";
        orderDoc.supplier_image = s.photo_url || s.url || s.image || "";
      }
    }

    if (storeId) {
      const stSnap = await db.collection("stores").doc(storeId).get();
      if (stSnap.exists) {
        const st = stSnap.data();
        orderDoc.store_name = st.name || st.nombre || "";
        orderDoc.store_image = st.photo_url || st.url || st.image || "";
        orderDoc.store_address = st.address || st.direccion || "";
        orderDoc.store_manager = st.manager || st.gerente || "";
      }
    }

    if (productId) {
      const pSnap = await db.collection("products").doc(productId).get();
      if (pSnap.exists) {
        const p = pSnap.data();
        orderDoc.product_name = p.nombre || p.name || "";
        orderDoc.product_image = p.url || p.photo_url || p.image || "";
        orderDoc.product_unit = p.unit || p.unidad || "";
      }
    }

    const docRef = await db.collection("orders").add(orderDoc);
    const created = await docRef.get();
    res.status(201).json({ id: created.id, folio: created.id, ...created.data() });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id - actualizar (actualiza snapshot si cambian ids)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const docRef = db.collection("orders").doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updateData = { ...payload };

    if (payload.supplierId) {
      const sSnap = await db.collection("suppliers").doc(payload.supplierId).get();
      if (sSnap.exists) {
        const s = sSnap.data();
        updateData.supplier_name = s.name || s.nombre || "";
        updateData.supplier_image = s.photo_url || s.url || s.image || "";
      }
    }

    if (payload.storeId) {
      const stSnap = await db.collection("stores").doc(payload.storeId).get();
      if (stSnap.exists) {
        const st = stSnap.data();
        updateData.store_name = st.name || st.nombre || "";
        updateData.store_image = st.photo_url || st.url || st.image || "";
        updateData.store_address = st.address || st.direccion || "";
        updateData.store_manager = st.manager || st.gerente || "";
      }
    }

    if (payload.productId) {
      const pSnap = await db.collection("products").doc(payload.productId).get();
      if (pSnap.exists) {
        const p = pSnap.data();
        updateData.product_name = p.nombre || p.name || "";
        updateData.product_image = p.url || p.photo_url || p.image || "";
        updateData.product_unit = p.unit || p.unidad || "";
      }
    }

    await docRef.update(updateData);
    const updated = await docRef.get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/orders/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("orders").doc(id);
    const snapshot = await docRef.get();
    if (!snapshot.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    await docRef.delete();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;