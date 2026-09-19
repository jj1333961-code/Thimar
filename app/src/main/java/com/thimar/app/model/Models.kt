package com.thimar.app.model

enum class UserRole(val labelAr: String, val titleAr: String) {
    STUDENT("طالب", "ثمار الطالب"),
    TEACHER("معلم", "ثمار المعلم"),
    PARENT("ولي أمر", "ثمار ولي الأمر"),
    ADMIN("مسؤول", "ثمار المسؤول")
}

data class Student(
    val id: String,
    val name: String,
    val progress: Int,
    val lastSurah: String,
    val level: String,
    val avatarLetter: String
)

data class Child(
    val id: String,
    val name: String,
    val level: String,
    val progress: Int,
    val teacher: String
)

enum class TaskType(val labelAr: String) {
    RECITATION("تسميع"),
    EXAM("اختبار"),
    HOMEWORK("واجب"),
    ACTIVITY("نشاط")
}

enum class TaskStatus(val labelAr: String) {
    NEW("جديد"),
    IN_PROGRESS("قيد الإنجاز"),
    COMPLETED("مكتمل"),
    GRADED("تم التقييم")
}

data class TaskItem(
    val id: Int,
    val type: TaskType,
    val title: String,
    val description: String,
    val status: TaskStatus,
    val deadline: String,
    val score: String? = null,
    val studentName: String = "ياسين عمر",
    val surahOrSubject: String = ""
)

data class Reciter(
    val id: String,
    val name: String,
    val style: String
)

data class SurahItem(
    val id: Int,
    val name: String,
    val englishName: String,
    val versesCount: Int,
    val startPage: Int,
    val juz: Int,
    val sampleText: String
)

data class TuhfatSection(
    val id: Int,
    val title: String,
    val verses: List<String>
)

data class JoinRequest(
    val id: Int,
    val name: String,
    val role: String,
    val date: String,
    var status: String = "pending"
)

data class ChatMessage(
    val id: String,
    val senderName: String,
    val text: String,
    val isUser: Boolean,
    val timestamp: String
)

data class ActivityLog(
    val action: String,
    val date: String,
    val status: String
)
