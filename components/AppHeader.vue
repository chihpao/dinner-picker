<template>
  <header class="hero" :class="{ 'hero--expenses': isExpenses }">
    <div class="hero-header">
      <h1>{{ title }}</h1>

      <div class="hero-actions">
        <slot name="actions"></slot>
        
        <div class="auth-bar">
          <button v-if="!user" @click="signInWithGoogle()" class="btn btn-google" type="button">
            <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span class="btn-text">登入</span>
          </button>
          
          <div v-else class="auth-pill">
            <button class="auth-avatar" @click="toggleMenu" :title="user.email">
              {{ userInitial }}
            </button>
            <transition name="pop">
              <div v-show="menuOpen" class="auth-menu">
                <div class="menu-header">
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <button @click="switchAccount" class="menu-item">
                  <span class="icon">↺</span> 切換帳號
                </button>
                <button @click="signOut" class="menu-item danger">
                  <span class="icon">×</span> 登出
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
    <slot name="bottom"></slot>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  isExpenses?: boolean
}>()

const { user, signInWithGoogle, signOut } = useAuth()
const menuOpen = ref(false)

const userInitial = computed(() => {
  return user.value?.email?.[0]?.toUpperCase() || 'U'
})

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const switchAccount = () => {
  signInWithGoogle()
  menuOpen.value = false
}

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.auth-pill')) {
      menuOpen.value = false
    }
  })
})
</script>

<style scoped>
.hero-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.hero-actions, .auth-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Auth Buttons */
.btn-google {
  gap: 8px;
  background: white;
  border: 1px solid var(--border);
  color: var(--ink);
  font-family: var(--font-pixel);
  letter-spacing: 0.05em;
}

.btn-google svg {
  width: 18px;
  height: 18px;
}

.auth-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px; /* Squircle */
  background: var(--primary);
  color: white;
  border: 1px solid rgba(0,0,0,0.1);
  font-family: var(--font-pixel);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s var(--ease-snappy);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.auth-avatar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.auth-pill {
  position: relative;
}

.auth-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 6px;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 50;
  transform-origin: top right;
}

.menu-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}

.user-email {
  font-size: 11px;
  color: var(--ink-light);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.menu-item {
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: left;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--ink);
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.1s;
}

.menu-item:hover {
  background: #f3f4f6;
  color: var(--primary);
}

.menu-item.danger:hover {
  color: var(--danger);
  background: #fef2f2;
}

.icon {
  font-family: var(--font-pixel); 
  width: 16px;
  text-align: center;
}

/* Animations */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.2s var(--ease-snappy);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
</style>
