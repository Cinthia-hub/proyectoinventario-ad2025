<template>
  <div v-if="visible" class="cm-overlay" @click.self="cancel">
    <div class="cm-card" role="dialog" aria-modal="true" aria-labelledby="cm-title">
      <header class="cm-header">
        <h3 id="cm-title">{{ title }}</h3>
        <button class="cm-close" @click="cancel" aria-label="Close">&times;</button>
      </header>

      <div class="cm-body">
        <p class="cm-message" v-html="message"></p>
      </div>

      <footer class="cm-footer">
        <button class="btn-white cm-btn" @click="cancel">Cancel</button>
        <button class="btn-blue cm-btn" @click="confirm">Delete</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: "ConfirmModal",
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: "Confirm" },
    message: { type: String, default: "Are you sure?" }
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>

<style scoped>
.cm-overlay{
  position: fixed;
  inset: 0;
  background: rgba(20,20,20,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300; /* above overlay and modals */
  padding: 18px;
}

.cm-card{
  width: 420px;
  max-width: calc(100% - 36px);
  background: white;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.18);
  overflow: hidden;
  display:flex;
  flex-direction:column;
}

.cm-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f0f0;
}

.cm-header h3{ margin:0; font-size:16px; color:#222; }

.cm-close{
  background:transparent;
  border:none;
  font-size:22px;
  line-height:1;
  color:#666;
  cursor:pointer;
  padding:2px 6px;
  border-radius:6px;
}
.cm-close:hover{ background:#f5f5f5; }

.cm-body{
  padding: 16px 18px;
  display:flex;
  align-items:center;
  min-height: 56px;
}

.cm-message{
  margin:0;
  color:#333;
  font-size:15px;
}

.cm-footer{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:10px;
  padding:12px 18px;
  border-top:1px solid #f0f0f0;
}

.cm-btn{
  padding:8px 14px;
  border-radius:8px;
  font-size:14px;
  cursor:pointer;
}

.btn-white{
  background:white;
  border:1px solid #dcdcdc;
  color:#333;
}

.btn-blue{
  background:#e53b3b; /* red to indicate delete */
  color:white;
  border:none;
}
</style>