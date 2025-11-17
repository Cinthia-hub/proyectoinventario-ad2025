<template>
  <div class="v-productData">
    <div class="v-productButtons">
      <h2 id="v-product-Name">{{ product.nombre }}</h2>
      <div>
        <button @click="$emit('edit', product)">Edit</button>
        <button @click="onDelete">Delete</button>
        <button @click="download">Download</button>
        <button @click="$emit('close')">Close</button>
      </div>
    </div>

    <div class="overview">
      <div class="col1">
        <div class="primaryDetails">
          <h5>Primary Details</h5>
          <div>
            <p class="txt-gray">Product Name</p>
            <p class="txt-darkgray txt-weight">{{ product.nombre }}</p>
          </div>
          <div>
            <p class="txt-gray">Product ID</p>
            <p class="txt-darkgray txt-weight">{{ product.id }}</p>
          </div>
          <div>
            <p class="txt-gray">Product category</p>
            <p class="txt-darkgray txt-weight">{{ product.category }}</p>
          </div>
          <div>
            <p class="txt-gray">Expiry Date</p>
            <p class="txt-darkgray txt-weight">{{ product.expiry_date }}</p>
          </div>
          <div>
            <p class="txt-gray">Threshold Value</p>
            <p class="txt-darkgray txt-weight">{{ product.threshold_value }}</p>
          </div>
        </div>
      </div>

      <div class="col2">
        <div class="v-productImage">
          <img :src="product.url" alt="" />
        </div>
        <div>
          <p class="txt-gray">Opening Stock</p>
          <p class="txt-darkgray txt-weight">{{ product.opening_stock }}</p>
        </div>
        <div>
          <p class="txt-gray">Remaining Stock</p>
          <p class="txt-darkgray txt-weight">{{ product.quantity }}</p>
        </div>
        <div>
          <p class="txt-gray">On the way</p>
          <p class="txt-darkgray txt-weight">{{ product.on_the_way }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from "../../api/product.api.js";

export default {
  props: { product: { type: Object, required: true } },
  methods: {
    async onDelete() {
      if (!confirm(`Delete "${this.product.nombre}"?`)) return;
      await api.deleteProduct(this.product.id);
      this.$emit("delete", this.product);
      this.$emit("close");
    },
    download() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("Product Details", 20, 20);
      const tableColumn = ["Detail", "Value"];
      const tableRows = [
        ["Product Name", this.product.nombre],
        ["Product ID", this.product.id],
        ["Product Category", this.product.category],
        ["Expiry Date", this.product.expiry_date],
        ["Threshold Value", this.product.threshold_value],
        ["Opening Stock", this.product.opening_stock],
        ["Remaining Stock", this.product.quantity],
        ["On the Way", this.product.on_the_way]
      ];
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "grid",
        margin: { top: 40, left: 20 }
      });
      doc.save(`${this.product.nombre}_details.pdf`);
    }
  }
};
</script>

<style scoped>
/* keep styling in main css */
</style>