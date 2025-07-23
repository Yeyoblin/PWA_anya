<?php
// Проверка, была ли отправлена форма
$formSent = false;
$formError = false;

$name = '';
$email = '';
$message = '';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Получаем данные из формы
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $message = $_POST['message'] ?? '';

    // Подключаемся к базе данных
    $connection = mysqli_connect("localhost", "root", "", "site");

    if (!$connection) {
        die("Ошибка подключения: " . mysqli_connect_error());
    }

    // Экранируем данные
    $nameEscaped = mysqli_real_escape_string($connection, $name);
    $emailEscaped = mysqli_real_escape_string($connection, $email);
    $messageEscaped = mysqli_real_escape_string($connection, $message);

    // SQL-запрос
    $sql = "INSERT INTO sitee (name, email, message) VALUES ('$nameEscaped', '$emailEscaped', '$messageEscaped')";

    // Выполняем запрос
    if (mysqli_query($connection, $sql)) {
        $formSent = true;
    } else {
        $formError = true;
    }

    mysqli_close($connection);
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Обратная связь</title>
    <style>
        .success {
            color: green;
            font-weight: bold;
        }
        .error {
            color: red;
            font-weight: bold;
        }
        .form-container {
            max-width: 700px;
            margin: 40px auto;
            padding: 20px;
            text-align: center;
        }
        .submitted-data {
            margin-top: 20px;
            text-align: left;
            background: #f4f4f4;
            padding: 15px;
            border-radius: 8px;
        }
        .submitted-data p {
            margin: 6px 0;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <!-- Уведомление об отправке -->
        <?php if ($formSent): ?>
            <h1 class="success">Спасибо! Ваша форма отправлена.</h1>
            <div class="submitted-data">
                <p><strong>Имя:</strong> <?= htmlspecialchars($name) ?></p>
                <p><strong>Email:</strong> <?= htmlspecialchars($email) ?></p>
                <p><strong>Сообщение:</strong> <?= nl2br(htmlspecialchars($message)) ?></p>
            </div>
        <?php elseif ($formError): ?>
            <p class="error">Произошла ошибка при отправке формы. Попробуйте ещё раз.</p>
        <?php endif; ?>
    </div>
</body>
</html>
