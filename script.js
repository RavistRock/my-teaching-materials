// Ключ для хранения файлов в LocalStorage браузера
const STORAGE_KEY = 'teacher_uploaded_files';

// Функция для загрузки файла
function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const messageEl = document.getElementById('message');

    // Проверяем, выбран ли файл
    if (fileInput.files.length === 0) {
        messageEl.textContent = 'Пожалуйста, выберите файл.';
        messageEl.style.color = 'red';
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name;

    // Создаем объект FileReader для чтения файла
    const reader = new FileReader();

    reader.onload = function(e) {
        // Получаем данные файла в виде строки base64
        const fileData = e.target.result;

        // Получаем текущий список файлов из LocalStorage
        let uploadedFiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // Проверяем, существует ли файл с таким именем
        if (uploadedFiles.some(f => f.name === fileName)) {
            messageEl.textContent = 'Файл с таким именем уже существует.';
            messageEl.style.color = 'red';
            return;
        }

        // Добавляем новый файл в список
        uploadedFiles.push({
            name: fileName,
            type: file.type,
            data: fileData,
            uploadDate: new Date().toLocaleDateString('ru-RU')
        });

        // Сохраняем обновленный список в LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedFiles));

        // Обновляем отображение списка файлов
        displayFiles();

        // Выводим сообщение об успехе
        messageEl.textContent = `Файл "${fileName}" успешно загружен!`;
        messageEl.style.color = 'green';

        // Очищаем поле выбора файла
        fileInput.value = '';
    };

    // Читаем файл как Data URL (base64)
    reader.readAsDataURL(file);
}

// Функция для удаления файла
function deleteFile(fileName) {
    if (confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`)) {
        // Получаем текущий список файлов из LocalStorage
        let uploadedFiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        // Фильтруем массив, удаляя файл с указанным именем
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);

        // Сохраняем обновленный список в LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedFiles));

        // Обновляем отображение списка файлов
        displayFiles();

        // Показываем сообщение об удалении
        const messageEl = document.getElementById('message');
        messageEl.textContent = `Файл "${fileName}" был удален.`;
        messageEl.style.color = 'orange';
    }
}

// Функция для отображения списка файлов
function displayFiles() {
    const materialsList = document.getElementById('materialsList');
    const uploadedFiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Очищаем список
    materialsList.innerHTML = '';

    if (uploadedFiles.length === 0) {
        materialsList.innerHTML = '<p>Пока файлов нет.</p>';
        return;
    }

    // Для каждого файла создаем карточку
    uploadedFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';

        // Определяем иконку в зависимости от типа файла
        let icon = '📄'; // Иконка по умолчанию
        if (file.type.includes('pdf')) icon = '📕';
        else if (file.type.includes('word') || file.type.includes('document')) icon = '📘';
        else if (file.type.includes('image')) icon = '🖼️';
        else if (file.type.includes('video')) icon = '🎬';
        else if (file.type.includes('audio')) icon = '🎵';
        else if (file.type.includes('zip') || file.type.includes('archive')) icon = '🗜️';

        fileCard.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-name">${file.name}</div>
            <div class="file-date">${file.uploadDate}</div>
            <div class="file-actions">
                <a href="${file.data}" download="${file.name}" class="download-btn">Скачать</a>
                <button onclick="deleteFile('${file.name}')" class="delete-btn">Удалить</button>
            </div>
        `;

        materialsList.appendChild(fileCard);
    });
}

// Отображаем файлы при загрузке страницы
document.addEventListener('DOMContentLoaded', displayFiles);
