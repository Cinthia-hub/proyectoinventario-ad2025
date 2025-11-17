<template>
    <v-container fluid class="login-background fill-height">
        <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4" lg="3">
            
            <v-card class="elevation-12 rounded-xl pa-6 login-card">
            
            <div class="text-center mb-6">
                <v-icon size="60" color="primary" class="mb-2">mdi-storefront</v-icon>
                <h1 class="text-h4 font-weight-bold text-primary">Bienvenido</h1>
                <p class="text-subtitle-1 text-medium-emphasis">Sistema de Inventario POS</p>
            </div>

            <v-form @submit.prevent="handleLogin">
                <v-text-field
                v-model="credentials.username"
                label="Usuario"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                color="primary"
                required
                ></v-text-field>

                <v-text-field
                v-model="credentials.password"
                label="Contraseña"
                prepend-inner-icon="mdi-lock"
                :type="visible ? 'text' : 'password'"
                :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="visible = !visible"
                variant="outlined"
                color="primary"
                class="mt-2"
                required
                ></v-text-field>

                <v-alert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                density="compact"
                class="mb-4 mt-2"
                >
                {{ errorMessage }}
                </v-alert>

                <v-btn
                type="submit"
                block
                color="primary"
                size="large"
                class="mt-4 rounded-lg font-weight-bold"
                :loading="loading"
                >
                Iniciar Sesión
                </v-btn>
            </v-form>

            </v-card>
            
        </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const visible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const credentials = ref({
    username: '',
    password: ''
})

const handleLogin = async () => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        // Usamos la acción de tu store
        await authStore.login(credentials.value)
        // Si no lanza error, redirigimos
        router.push('/dashboard') 
    } catch (error) {
        console.error(error)
        errorMessage.value = error.response?.data?.message || 'Credenciales incorrectas o error de servidor'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-background {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    height: 100vh;
    width: 100vw;
}
.login-card {
    background-color: rgba(255, 255, 255, 0.95) !important;
}
</style>