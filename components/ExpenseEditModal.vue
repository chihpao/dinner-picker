<template>
  <div class="bottom-sheet-overlay" @click.self="cancelEdit" role="dialog" aria-modal="true">
    <div class="bottom-sheet">
      <div class="bottom-sheet-handle"></div>
      <div class="modal-header">
        <h3>編輯紀錄</h3>
      </div>
      <div class="edit-form-layout">
        <div class="edit-group type-group">
          <div class="type-toggle">
            <button 
              type="button" 
              :class="['btn btn-sm', editForm.type === 'expense' ? 'danger' : 'outline']"
              @click="editForm.type = 'expense'"
            >
              支出
            </button>
            <button 
              type="button" 
              :class="['btn btn-sm', editForm.type === 'income' ? 'success' : 'outline']"
              @click="editForm.type = 'income'"
            >
              收入
            </button>
          </div>
        </div>

        <div class="edit-group date-group">
          <label class="input-label">
            <span>日期</span>
            <input type="date" v-model="editForm.date">
          </label>
          <div class="quick-tags">
            <button class="tag-btn" type="button" @click="setToday">今天</button>
            <button class="tag-btn" type="button" @click="setYesterday">昨天</button>
          </div>
        </div>

        <div class="edit-group amount-group">
          <label class="input-label">
            <span>金額</span>
            <input type="number" v-model.number="editForm.amount" min="0" step="1">
          </label>
          <div class="quick-tags scrollable">
            <button class="tag-btn" type="button" @click="adjustAmount(10)">+10</button>
            <button class="tag-btn" type="button" @click="adjustAmount(50)">+50</button>
            <button class="tag-btn" type="button" @click="adjustAmount(100)">+100</button>
          </div>
        </div>

        <div class="edit-group detail-group">
          <label class="input-label">
            <span>帳戶</span>
            <select v-model="editForm.account_id">
              <option value="">未指定</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </label>
          
          <label class="input-label" v-if="editForm.type === 'expense' && !isEditingTransfer">
            <span>類型</span>
            <select v-model="editForm.sub_type">
              <option value="general">一般</option>
              <option value="zibao">孜保平分</option>
            </select>
          </label>
          <label class="input-label" v-else-if="isEditingTransfer">
            <span>類型</span>
            <input type="text" value="轉帳" readonly>
          </label>

          <label class="input-label" v-if="editForm.type === 'expense' && !isEditingTransfer">
            <span>類別</span>
            <select v-model="editForm.category">
              <option value="">未指定</option>
              <option v-for="cat in EXPENSE_CATEGORIES" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </label>

          <label class="input-label flex-grow">
            <span>備註</span>
            <input type="text" v-model="editForm.note" placeholder="備註...">
          </label>
        </div>

        <div class="edit-actions">
          <button :class="['btn', editForm.type === 'income' ? 'success' : 'primary']" @click="saveEdit" type="button">儲存</button>
          <button class="btn danger" @click="deleteFromEdit" type="button">刪除</button>
          <button class="btn" @click="cancelEdit" type="button">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { ExpenseEntry } from '~/stores/expenses'
import { EXPENSE_CATEGORIES, useExpensesStore } from '~/stores/expenses'
import { useAccountsStore } from '~/stores/accounts'
import { useToast } from '~/composables/useToast'
import { isTransferEntry, toISODate, vibrate } from '~/utils'

const props = defineProps<{
  entry: ExpenseEntry | null
}>()

const emit = defineEmits<{
  close: []
  deleted: [id: string]
}>()

const accountsStore = useAccountsStore()
const { accounts } = storeToRefs(accountsStore)

const expensesStore = useExpensesStore()
const { updateEntry, deleteEntry } = expensesStore

const { success, danger } = useToast()

const editForm = reactive({
  date: '',
  amount: 0,
  note: '',
  account_id: '',
  type: 'expense' as 'expense' | 'income',
  sub_type: 'general',
  category: '',
})

const isEditingTransfer = computed(() => props.entry ? isTransferEntry(props.entry) : false)

const syncForm = () => {
  if (!props.entry) return
  editForm.date = props.entry.date
  editForm.amount = Math.abs(props.entry.amount)
  editForm.note = props.entry.note ?? ''
  editForm.account_id = props.entry.account_id ?? ''
  editForm.type = props.entry.amount < 0 ? 'income' : 'expense'
  editForm.sub_type = isTransferEntry(props.entry) ? 'transfer' : (props.entry.sub_type ?? 'general')
  editForm.category = props.entry.category ?? ''
}

onMounted(() => {
  syncForm()
  vibrate(10)
})

watch(() => props.entry, syncForm)

const cancelEdit = () => {
  emit('close')
}

const saveEdit = async () => {
  if (!props.entry) return
  if (!editForm.date) return danger('請選擇日期')
  
  const finalAmount = editForm.type === 'income' ? -Math.abs(editForm.amount) : Math.abs(editForm.amount)
  const nextSubType = isEditingTransfer.value ? 'transfer' : editForm.sub_type

  await updateEntry({
    ...props.entry,
    date: editForm.date,
    amount: Math.round(finalAmount),
    note: editForm.note ?? '',
    account_id: editForm.account_id || null,
    sub_type: nextSubType,
    category: editForm.type === 'expense' ? (editForm.category || null) : null,
  })
  
  emit('close')
}

const deleteFromEdit = async () => {
  if (!props.entry) return
  const id = props.entry.id
  await deleteEntry(id)
  vibrate(40)
  success('成功刪除紀錄')
  emit('deleted', id)
  emit('close')
}

const adjustAmount = (delta: number) => {
  editForm.amount = Math.max(0, Math.round((editForm.amount || 0) + delta))
}

const setToday = () => editForm.date = toISODate(new Date())
const setYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  editForm.date = toISODate(d)
}
</script>

<style scoped>
.modal-header h3 {
  font-size: 18px;
  text-align: center;
  margin-bottom: 16px;
  margin-top: 0;
}
.edit-form-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.edit-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-light);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.input-label input, .input-label select {
  height: 38px;
  border: 1px solid var(--border);
  border-radius: 0px;
  padding: 0 12px;
  font-family: var(--font-sans);
  background: var(--bg-paper);
  color: var(--ink);
}
.input-label input:focus, .input-label select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.2);
}
.type-toggle {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 0px;
}
.btn-sm {
  flex: 1;
  font-size: 12px;
  height: 32px;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  font-family: var(--font-pixel);
}
.btn-sm.outline {
  background: transparent;
  box-shadow: none;
  color: var(--ink-light);
}
.btn-sm.danger {
  background: var(--danger);
  color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.btn-sm.success {
  background: var(--success);
  color: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.quick-tags {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.tag-btn {
  border: 1px solid var(--border);
  background: var(--bg-paper);
  color: var(--ink);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}
.tag-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.edit-actions .btn {
  flex: 1;
}
</style>
