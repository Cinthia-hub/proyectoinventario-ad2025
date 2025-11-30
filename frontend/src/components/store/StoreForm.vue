<template>
  <article class="addform">
    <form class="supplier-form" @submit.prevent="submit">
      <h2>{{ store && store.id ? 'Edit Store' : 'New Store' }}</h2>

      <div class="form-grid">
        <div class="fields-col">
          <div class="form-row">
            <label class="row-label">Name</label>
            <input v-model="form.name" placeholder="Store name" required />
          </div>

          <div class="form-row">
            <label class="row-label">Address</label>
            <input v-model="form.address" placeholder="Address" />
          </div>

          <div class="form-row">
            <label class="row-label">Phone</label>
            <input v-model="form.phone" placeholder="Phone" />
          </div>

          <div class="form-row">
            <label class="row-label">Manager</label>
            <input v-model="form.manager" placeholder="Manager name" />
          </div>

          <div class="form-row">
            <label class="row-label">Image URL</label>
            <input v-model="form.photo_url" placeholder="https://example.com/image.jpg" />
          </div>

          <div class="form-row">
            <label class="row-label">Notes</label>
            <textarea v-model="form.notes" rows="3" placeholder="Optional notes"></textarea>
          </div>

          <div class="buttonsAdd form-row buttons-row">
            <div></div>
            <div class="buttons-right">
              <button type="button" class="btn-white" @click="close">Discard</button>
              <button type="submit" class="btn-blue">{{ store && store.id ? 'Update' : 'Create' }}</button>
            </div>
          </div>
        </div>

        <div class="preview-col">
          <div class="preview-block">
            <label>Preview</label>
            <img :src="form.photo_url || placeholder" @error="onImgError" class="img-preview"/>
            <div class="preview-caption">{{ form.name || '' }}</div>
            <div class="preview-caption small">{{ form.address || '' }}</div>
          </div>
        </div>
      </div>
    </form>
  </article>
</template>

<script>
import * as api from "./../../api/stores.api.js";

export default {
  props: { store: { default: null } },
  data() {
    return {
      form: {
        name: "",
        address: "",
        phone: "",
        manager: "",
        photo_url: "",
        notes: ""
      },
      placeholder:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='14'>No Image</text></svg>"
        )
    };
  },
  computed: {
    truncatedUrl() {
      if (!this.form.photo_url) return "";
      const u = this.form.photo_url;
      return u.length > 80 ? u.slice(0, 60) + "..." : u;
    }
  },
  methods: {
    async submit() {
      try {
        let result = null;
        if (this.store && this.store.id) {
          // update and capture returned updated store
          result = await api.updateStore(this.store.id, this.form);
        } else {
          // create and capture created store
          result = await api.addStore(this.form);
        }
        // Emitamos el resultado al padre para que actualice inmediatamente
        this.$emit("saved", result);
      } catch (err) {
        console.error("Save store error", err);
        alert("Error saving store. See console.");
      }
    },
    close() { this.$emit("close"); },
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.placeholder;
    },
    copyUrl() {
      if (!this.form.photo_url) return;
      navigator.clipboard?.writeText(this.form.photo_url).then(() => {
        console.log("Copied image URL:", this.form.photo_url);
      }).catch(()=>{});
    }
  },
  mounted() {
    if (this.store) {
      this.form = { ...this.store };
      if (!this.form.photo_url) this.form.photo_url = "";
      if (!this.form.notes) this.form.notes = "";
    }
  },
  watch: {
    store(newVal) {
      if (newVal) this.form = { ...newVal };
      else this.form = { name: "", address: "", phone: "", manager: "", photo_url: "", notes: "" };
    }
  }
};
</script>

<style scoped>
/* same styles as before */
.addform { position: fixed; left: 50%; top: 40px; transform: translateX(-50%); width: 720px; max-width: calc(100% - 40px); border-radius: 8px; background-color: white; z-index: 1200; padding: 18px; box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
.supplier-form h2 { margin: 4px 0 12px 0; font-size: 20px; }
.form-grid { display:flex; gap:18px; align-items:start; }
.fields-col { flex:1; display:flex; flex-direction:column; gap:10px; }
.preview-col { width:280px; display:flex; flex-direction:column; gap:12px; }
.form-row { display:flex; align-items:center; gap:12px; }
.row-label { width:120px; font-size:14px; color:#6d6c6c; }
.form-row input, .form-row textarea { flex:1; padding:9px 12px; border-radius:6px; border:1px solid #d6d6d6; font-size:13px; }
.img-preview { width:100%; height:160px; object-fit:cover; border-radius:6px; border:1px solid #e6e6e6; }
.preview-caption { color:#444; font-weight:600; margin-top:6px; }
.preview-caption.small { color:#777; font-weight:400; font-size:12px; margin-top:2px; }
.preview-caption.url { margin-top:8px; }
.url-text { color:#1f7bff; cursor:pointer; font-size:12px; word-break:break-all; }
.buttons-row { margin-top:12px; }
.buttons-right { display:flex; gap:12px; justify-content:flex-end; }
.btn-blue { padding:8px 14px; color:white; background:rgb(51,87,249); border:none; border-radius:6px; }
.btn-white { padding:8px 14px; background:white; border:1px solid #dcdcdc; border-radius:6px; }
</style>