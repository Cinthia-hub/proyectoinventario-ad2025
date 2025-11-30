<template>
  <div class="fm-overlay" @click.self="onClose">
    <div class="fm-card" role="dialog" aria-modal="true" aria-labelledby="fm-title">
      <header class="fm-header">
        <h3 id="fm-title">Filter orders</h3>
        <button class="fm-close" @click="onClose" aria-label="Close">&times;</button>
      </header>

      <div class="fm-body">
        <label class="fm-label">Field</label>
        <select v-model="field" class="fm-select">
          <option v-for="f in fields" :key="f.value" :value="f.value">{{ f.label }}</option>
        </select>

        <label class="fm-label">Value</label>
        <input v-model="value" :placeholder="placeholderFor(field)" class="fm-input" @keyup.enter="apply" />

        <p class="fm-hint">Tip: use partial text for names or folio.</p>
      </div>

      <footer class="fm-footer">
        <button class="btn-white fm-btn" @click="onClear">Clear</button>
        <div class="fm-actions">
          <button class="btn-white fm-btn" @click="onClose">Cancel</button>
          <button class="btn-blue fm-btn" @click="apply">Apply</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrdersFilterModal",
  props: {
    fields: { type: Array, required: true },
    initial: { type: Object, default: () => ({ field: "", value: "" }) }
  },
  data() {
    return {
      field: this.initial.field || (this.fields[0] && this.fields[0].value) || "",
      value: this.initial.value || ""
    };
  },
  methods: {
    apply() {
      this.$emit("apply", { field: this.field, value: this.value });
      this.$emit("close");
    },
    onClose() { this.$emit("close"); },
    onClear() { this.field = this.fields[0] ? this.fields[0].value : ""; this.value = ""; this.$emit("clear"); this.$emit("close"); },
    placeholderFor(field) {
      const map = {
        id: "Enter folio (order id)",
        admin_name: "Enter admin name",
        supplier_name: "Enter supplier name",
        store_name: "Enter store name",
        product_name: "Enter product name",
        order_date: "YYYY-MM-DD",
        delivery_date: "YYYY-MM-DD"
      };
      return map[field] || "Enter value";
    }
  }
};
</script>

<style scoped>
/* same style as other FilterModals in your project */
.fm-overlay{ position: fixed; inset: 0; background: rgba(20,20,20,0.35); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 18px; }
.fm-card{ width: 480px; max-width: calc(100% - 36px); background: white; border-radius: 10px; box-shadow: 0 12px 28px rgba(0,0,0,0.18); overflow: hidden; display: flex; flex-direction: column; }
.fm-header{ display:flex; align-items:center; justify-content:space-between; padding: 14px 18px; border-bottom: 1px solid #f0f0f0; }
.fm-header h3{ margin:0; font-size:16px; color:#222; }
.fm-close{ background:transparent; border:none; font-size:22px; line-height:1; color:#666; cursor:pointer; padding:2px 6px; border-radius:6px; }
.fm-body{ padding: 16px 18px; display:flex; flex-direction:column; gap:10px; }
.fm-label{ font-size:13px; color:#6d6c6c; margin-bottom:4px; }
.fm-select, .fm-input{ width:100%; padding:10px 12px; border-radius:8px; border:1px solid #d9d9d9; font-size:14px; background:white; box-sizing:border-box; }
.fm-hint{ margin:6px 0 0; font-size:12px; color:#9c9c9c; }
.fm-footer{ display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid #f0f0f0; gap:10px; }
.fm-actions{ display:flex; gap:10px; align-items:center; }
.fm-btn{ padding:8px 14px; border-radius:8px; font-size:14px; cursor:pointer; }
.btn-white{ background:white; border:1px solid #dcdcdc; color:#333; }
.btn-blue{ background: #2f6cf2; color:white; border:none; }
@media (max-width:520px){ .fm-card{ width:100%; } }
</style>