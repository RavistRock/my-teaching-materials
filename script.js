// Замените ВЕСЬ код в script.js на этот:

const MATERIALS_JSON = './materials.json';

// Функция для загрузки файла
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const messageEl = document.getElementById('message');

    if (fileInput.files.length === 0) {
        messageEl.textContent = 'Пожалуйста, выберите файл.';
        messageEl.style.color = 'red';
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name;

    const reader = new FileReader();

    reader.onload = async function(e) {
        const fileData = e.target.result;

        try {
            // Загружаем текущие материалы
            const response = await fetch(MATERIALS_JSON);
            const data = await response.json();
            let uploadedFiles = data.files || [];

            // Проверяем, существует ли файл
            if (uploadedFiles.some(f => f.name === fileName)) {
                messageEl.textContent = 'Файл с таким именем уже существует.';
                messageEl.style.color = 'red';
                return;
            }

            // Добавляем новый файл
            uploadedFiles.push({
                name: fileName,
                type: file.type,
                data: fileData,
                uploadDate: new Date().toLocaleDateString('ru-RU')
            });

            // ВАЖНО: На GitHub Pages мы не можем сохранять в JSON файл,
            // поэтому будем использовать localStorage как временное решение
            // Для реального сайта нужен сервер
            localStorage.setItem('teacher_files_backup', JSON.stringify(uploadedFiles));

            // Обновляем отображение
            displayFiles();

            messageEl.textContent = `Файл "${fileName}" успешно загружен! (локально)`;
            messageEl.style.color = 'green';
            fileInput.value = '';

            // Показываем подсказку для реального хостинга
            console.log('Для реального сайта нужен хостинг с поддержкой PHP/Node.js');

        } catch (error) {
            console.error('Ошибка:', error);
            messageEl.textContent = 'Ошибка загрузки. Используется локальное хранилище.';
            messageEl.style.color = 'orange';
        }
    };

    reader.readAsDataURL(file);
}

// Функция для удаления файла
function deleteFile(fileName) {
    if (confirm(`Вы уверены, что хотите удалить файл "${fileName}"?`)) {
        let uploadedFiles = JSON.parse(localStorage.getItem('teacher_files_backup')) || [];
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        localStorage.setItem('teacher_files_backup', JSON.stringify(uploadedFiles));
        displayFiles();

        const messageEl = document.getElementById('message');
        messageEl.textContent = `Файл "${fileName}" был удален.`;
        messageEl.style.color = 'orange';
    }
}

// Функция для отображения списка файлов
async function displayFiles() {
    const materialsList = document.getElementById('materialsList');

    // Пробуем загрузить из JSON, если нет - из localStorage
    let uploadedFiles = [];

    try {
        const response = await fetch(MATERIALS_JSON);
        const data = await response.json();
        uploadedFiles = data.files || [];

        // Объединяем с локальными файлами (если есть)
        const localFiles = JSON.parse(localStorage.getItem('teacher_files_backup')) || [];
        const allFiles = [...uploadedFiles, ...localFiles.filter(localFile =>
            !uploadedFiles.some(jsonFile => jsonFile.name === localFile.name)
        )];

        uploadedFiles = allFiles;
    } catch (error) {
        // Если JSON не доступен, используем localStorage
        uploadedFiles = JSON.parse(localStorage.getItem('teacher_files_backup')) || [];
    }

    materialsList.innerHTML = '';

    if (uploadedFiles.length === 0) {
        materialsList.innerHTML = '<p>Пока файлов нет.</p>';
        return;
    }

    uploadedFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';

        let icon = '📄';
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
