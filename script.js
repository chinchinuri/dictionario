document.addEventListener('DOMContentLoaded', () => {

    // --- СТАН ДОДАТКУ ---
    let state = {
        title: "Новий словник",
        description: "Створено за допомогою конструктора словників.",
        fields: ['term', 'translation', 'explanation'],
        data: [],
        editingIndex: null // індекс рядка, що редагується
    };

    // --- ОТРИМАННЯ ЕЛЕМЕНТІВ DOM ---
    const dictionaryTitleEl = document.getElementById('dictionaryTitle');
    const dictionaryDescriptionEl = document.getElementById('dictionaryDescription');
    const newFieldNameEl = document.getElementById('newFieldName');
    const addFieldBtn = document.getElementById('addFieldBtn');
    const fieldListEl = document.getElementById('fieldList');
    const addEntryFormEl = document.getElementById('addEntryForm');
    const dataTableContainerEl = document.getElementById('dataTableContainer');
    const importJsonInput = document.getElementById('importJsonInput');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportXlsxBtn = document.getElementById('exportXlsxBtn');

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    const deriveFieldsFromData = (data) => {
        if (!Array.isArray(data) || data.length === 0) return [];
        const fieldSet = new Set();
        data.forEach(item => Object.keys(item).forEach(key => fieldSet.add(key)));
        if (data.some(item => item.hasOwnProperty('category'))) {
            fieldSet.add('category');
        }
        return Array.from(fieldSet);
    };

    // --- ФУНКЦІЇ РЕНДЕРИНГУ ---

    const renderFieldList = () => {
        fieldListEl.innerHTML = '';
        state.fields.forEach(field => {
            const fieldTag = document.createElement('div');
            fieldTag.className = 'field-tag';
            fieldTag.innerHTML = `
                <span>${field}</span>
                <button class="delete-field-btn" data-field="${field}">×</button>
            `;
            fieldListEl.appendChild(fieldTag);
        });
    };

    const renderAddEntryForm = () => {
        addEntryFormEl.innerHTML = '';
        if (state.fields.length === 0) return;

        state.fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            const label = document.createElement('label');
            label.setAttribute('for', `entry-${field}`);
            label.textContent = field.charAt(0).toUpperCase() + field.slice(1);
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `entry-${field}`;
            input.name = field;
            input.placeholder = `Введіть ${field}...`;
            formGroup.appendChild(label);
            formGroup.appendChild(input);
            addEntryFormEl.appendChild(formGroup);
        });

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Додати запис';
        addEntryFormEl.appendChild(submitButton);
    };

    const renderDataTable = () => {
        if (state.fields.length === 0 && state.data.length === 0) {
            dataTableContainerEl.innerHTML = '<p class="no-data">Дані відсутні. Додайте поля та записи.</p>';
            return;
        }

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        state.fields.forEach(field => {
            const th = document.createElement('th');
            th.textContent = field;
            headerRow.appendChild(th);
        });
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Дії';
        headerRow.appendChild(actionTh);
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        state.data.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            if (index === state.editingIndex) {
                // Рядок в режимі редагування
                state.fields.forEach(field => {
                    const td = document.createElement('td');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'edit-input';
                    input.name = field;
                    input.value = entry[field] || '';
                    td.appendChild(input);
                    row.appendChild(td);
                });
                
                const actionTd = document.createElement('td');
                const saveBtn = document.createElement('button');
                saveBtn.className = 'save-entry-btn action-btn';
                saveBtn.textContent = 'Зберегти';
                saveBtn.dataset.index = index;
                actionTd.appendChild(saveBtn);
                
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'cancel-edit-btn action-btn';
                cancelBtn.textContent = 'Скасувати';
                actionTd.appendChild(cancelBtn);
                row.appendChild(actionTd);
            } else {
                // Звичайний рядок
                state.fields.forEach(field => {
                    const td = document.createElement('td');
                    td.textContent = entry[field] || '';
                    row.appendChild(td);
                });
                
                const actionTd = document.createElement('td');
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-entry-btn action-btn';
                editBtn.textContent = 'Редагувати';
                editBtn.dataset.index = index;
                actionTd.appendChild(editBtn);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-entry-btn action-btn';
                deleteBtn.textContent = 'Видалити';
                deleteBtn.dataset.index = index;
                actionTd.appendChild(deleteBtn);
                row.appendChild(actionTd);
            }
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        dataTableContainerEl.innerHTML = '';
        dataTableContainerEl.appendChild(table);
    };

    const renderAll = () => {
        renderFieldList();
        renderAddEntryForm();
        renderDataTable();
    };

    // --- ОБРОБНИКИ ПОДІЙ ---

    addFieldBtn.addEventListener('click', () => {
        const fieldName = newFieldNameEl.value.trim().toLowerCase().replace(/\s/g, '_');
        if (fieldName && !state.fields.includes(fieldName)) {
            state.fields.push(fieldName);
            newFieldNameEl.value = '';
            renderAll();
        } else if (!fieldName) {
            alert('Назва поля не може бути пустою.');
        } else {
            alert('Таке поле вже існує.');
        }
    });

    fieldListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-field-btn')) {
            const fieldToDelete = e.target.dataset.field;
            if (confirm(`Ви впевнені, що хочете видалити поле "${fieldToDelete}"? Усі дані в цьому стовпці буде втрачено.`)) {
                state.fields = state.fields.filter(f => f !== fieldToDelete);
                state.data.forEach(entry => delete entry[fieldToDelete]);
                renderAll();
            }
        }
    });

    addEntryFormEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEntry = {};
        let isEmpty = true;
        state.fields.forEach(field => {
            const value = e.target.elements[field].value;
            newEntry[field] = value;
            if (value.trim() !== '') isEmpty = false;
        });
        if (isEmpty) {
            alert("Неможливо додати пустий запис.");
            return;
        }
        state.data.push(newEntry);
        e.target.reset();
        renderDataTable();
    });
    
    dictionaryTitleEl.addEventListener('input', (e) => state.title = e.target.value);
    dictionaryDescriptionEl.addEventListener('input', (e) => state.description = e.target.value);

    dataTableContainerEl.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.classList.contains('delete-entry-btn')) {
            const indexToDelete = parseInt(target.dataset.index, 10);
            if (confirm(`Ви впевнені, що хочете видалити запис №${indexToDelete + 1}?`)) {
                state.data.splice(indexToDelete, 1);
                state.editingIndex = null; // На випадок, якщо видаляли під час редагування іншого
                renderDataTable();
            }
        }
        
        if (target.classList.contains('edit-entry-btn')) {
            const indexToEdit = parseInt(target.dataset.index, 10);
            state.editingIndex = indexToEdit;
            renderDataTable();
        }

        if (target.classList.contains('cancel-edit-btn')) {
            state.editingIndex = null;
            renderDataTable();
        }

        if (target.classList.contains('save-entry-btn')) {
            const indexToSave = parseInt(target.dataset.index, 10);
            const row = target.closest('tr');
            const inputs = row.querySelectorAll('.edit-input');
            
            const updatedEntry = { ...state.data[indexToSave] };
            inputs.forEach(input => {
                updatedEntry[input.name] = input.value;
            });
            
            state.data[indexToSave] = updatedEntry;
            state.editingIndex = null;
            renderDataTable();
        }
    });

    // --- ЛОГІКА ІМПОРТУ ТА ЕКСПОРТУ ---

    importJsonInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedJson = JSON.parse(event.target.result);
                let title = 'Імпортований словник';
                let description = '';
                let data = [];

                if (Array.isArray(importedJson.data)) {
                    title = importedJson.title || title;
                    description = importedJson.description || description;
                    data = importedJson.data;
                } else {
                    const mainKey = Object.keys(importedJson)[0];
                    if (mainKey && typeof importedJson[mainKey] === 'object') {
                        title = mainKey.replace(/([A-Z])/g, ' $1').trim();
                        const categories = importedJson[mainKey];
                        for (const categoryKey in categories) {
                            if (Array.isArray(categories[categoryKey])) {
                                const termsWithCategory = categories[categoryKey].map(term => ({
                                    ...term,
                                    category: categoryKey
                                }));
                                data.push(...termsWithCategory);
                            }
                        }
                    }
                }
                
                if (data.length === 0) {
                    throw new Error('Не вдалося знайти дані для імпорту у файлі. Перевірте структуру JSON.');
                }
                
                state.title = title;
                state.description = description;
                state.data = data;
                state.fields = deriveFieldsFromData(data);
                state.editingIndex = null; // Скидаємо режим редагування після імпорту

                init();
                alert('Словник успішно завантажено!');

            } catch (error) {
                alert(`Помилка під час зчитування файлу: ${error.message}`);
            } finally {
                e.target.value = null;
            }
        };
        reader.readAsText(file);
    });

    const downloadFile = (filename, content, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    exportJsonBtn.addEventListener('click', () => {
        const exportState = {
            title: state.title,
            description: state.description,
            data: state.data
        };
        const jsonString = JSON.stringify(exportState, null, 2);
        downloadFile(`${state.title.replace(/\s/g, '_') || 'dictionary'}.json`, jsonString, 'application/json');
    });

    exportCsvBtn.addEventListener('click', () => {
        const headers = state.fields.join(',');
        const rows = state.data.map(entry =>
            state.fields.map(field => {
                let value = entry[field] || '';
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        );
        const csvString = [headers, ...rows].join('\n');
        downloadFile(`${state.title.replace(/\s/g, '_') || 'dictionary'}.csv`, csvString, 'text/csv;charset=utf-8;');
    });

    exportXlsxBtn.addEventListener('click', () => {
        const worksheet = XLSX.utils.json_to_sheet(state.data, { header: state.fields });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Словник");
        XLSX.writeFile(workbook, `${state.title.replace(/\s/g, '_') || 'dictionary'}.xlsx`);
    });

    // --- ІНІЦІАЛІЗАЦІЯ ---
    const init = () => {
        dictionaryTitleEl.value = state.title;
        dictionaryDescriptionEl.value = state.description;
        renderAll();
    };

    init();
});