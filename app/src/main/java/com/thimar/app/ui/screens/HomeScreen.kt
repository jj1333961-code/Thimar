package com.thimar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.audio.ThimarAudioPlayer
import com.thimar.app.data.ThimarRepository
import com.thimar.app.model.Child
import com.thimar.app.model.JoinRequest
import com.thimar.app.model.Student
import com.thimar.app.model.UserRole
import com.thimar.app.ui.theme.*

@Composable
fun HomeScreen(
    currentRole: UserRole,
    audioPlayer: ThimarAudioPlayer,
    onStartLiveRecitation: () -> Unit,
    onNavigateToQuran: () -> Unit,
    onNavigateToTasks: () -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ThimarBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        when (currentRole) {
            UserRole.STUDENT -> {
                item {
                    StudentDailyTaskCard(
                        onStartSession = onStartLiveRecitation,
                        onOpenQuran = onNavigateToQuran
                    )
                }
                item {
                    RecitersQuickPlayer(audioPlayer = audioPlayer)
                }
                item {
                    StudentAchievementCard()
                }
            }
            UserRole.TEACHER -> {
                item {
                    TeacherHeaderStats()
                }
                item {
                    Text(
                        text = "طلابي المقيدون في الحلقة",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = ThimarTextPrimary
                    )
                }
                items(ThimarRepository.students) { student ->
                    TeacherStudentCard(student = student)
                }
                item {
                    TeacherWeeklyStats()
                }
            }
            UserRole.PARENT -> {
                item {
                    ParentChildrenSection()
                }
            }
            UserRole.ADMIN -> {
                item {
                    AdminOverviewSection(onStartSession = onStartLiveRecitation)
                }
            }
        }
    }
}

@Composable
private fun StudentDailyTaskCard(
    onStartSession: () -> Unit,
    onOpenQuran: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = ThimarEmeraldContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = ThimarEmeraldPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "مهمة اليوم",
                            fontWeight = FontWeight.Bold,
                            color = ThimarEmeraldDark,
                            fontSize = 13.sp
                        )
                    }
                }

                Surface(
                    color = ThimarSurfaceVariant,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "التقدم: ٨٢٪",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        fontWeight = FontWeight.Bold,
                        color = ThimarEmeraldPrimary,
                        fontSize = 12.sp
                    )
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "سورة النور",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black,
                    color = ThimarTextPrimary
                )
                Text(
                    text = "من الآية ١ إلى الآية ٢٠ • مراجعة التلاوة والمدود",
                    style = MaterialTheme.typography.bodyMedium,
                    color = ThimarTextSecondary
                )
            }

            // Progress Bar
            LinearProgressIndicator(
                progress = { 0.82f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp)),
                color = ThimarEmeraldPrimary,
                trackColor = ThimarEmeraldContainer,
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onStartSession,
                    colors = ButtonDefaults.buttonColors(containerColor = ThimarEmeraldPrimary),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Mic,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "تسميع مباشر مع AI", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onOpenQuran,
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ThimarEmeraldPrimary)
                ) {
                    Text(text = "فتح المصحف", color = ThimarEmeraldPrimary, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun RecitersQuickPlayer(audioPlayer: ThimarAudioPlayer) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Headphones,
                    contentDescription = null,
                    tint = ThimarEmeraldPrimary
                )
                Text(
                    text = "استمع لتلاوة كبار المقرئين",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = ThimarTextPrimary
                )
            }

            ThimarRepository.reciters.forEach { reciter ->
                val isPlayingThis = audioPlayer.isPlaying && audioPlayer.currentTrackId == reciter.id
                Surface(
                    onClick = {
                        audioPlayer.playTrack(reciter.id)
                    },
                    shape = RoundedCornerShape(16.dp),
                    color = if (isPlayingThis) ThimarEmeraldContainer else ThimarSurfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(if (isPlayingThis) ThimarEmeraldPrimary else Color.White),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (isPlayingThis) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = null,
                                    tint = if (isPlayingThis) Color.White else ThimarEmeraldPrimary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = reciter.name,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isPlayingThis) ThimarEmeraldDark else ThimarTextPrimary,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = reciter.style,
                                    color = ThimarTextMuted,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        if (isPlayingThis) {
                            Text(
                                text = "يشتغل الآن",
                                style = MaterialTheme.typography.labelSmall,
                                color = ThimarEmeraldPrimary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StudentAchievementCard() {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = ThimarAmberContainer),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "آخر وسام مكتسب",
                    style = MaterialTheme.typography.labelSmall,
                    color = ThimarAmberOnContainer
                )
                Text(
                    text = "وسام الحافظ النشط 🌟",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Black,
                    color = ThimarAmberOnContainer
                )
                Text(
                    text = "أتممت ورد التسميع لـ ٧ أيام متتالية دون انقطاع",
                    style = MaterialTheme.typography.bodySmall,
                    color = ThimarAmberOnContainer.copy(alpha = 0.8f)
                )
            }
            Icon(
                imageVector = Icons.Default.EmojiEvents,
                contentDescription = null,
                tint = ThimarAmberAccent,
                modifier = Modifier.size(48.dp)
            )
        }
    }
}

@Composable
private fun TeacherHeaderStats() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Column {
            Text(
                text = "أهلاً بك، أستاذ أحمد",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = ThimarTextPrimary
            )
            Text(
                text = "لديك ٤ طلاب اليوم بانتظار متابعة التسميع",
                style = MaterialTheme.typography.bodyMedium,
                color = ThimarTextSecondary
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "٢٤", fontWeight = FontWeight.Black, fontSize = 26.sp, color = ThimarEmeraldPrimary)
                    Text(text = "تسميع منجز هذا الشهر", style = MaterialTheme.typography.labelSmall, color = ThimarTextSecondary)
                }
            }

            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "٥", fontWeight = FontWeight.Black, fontSize = 26.sp, color = ThimarAmberAccent)
                    Text(text = "مهام معلقة للتقييم", style = MaterialTheme.typography.labelSmall, color = ThimarTextSecondary)
                }
            }
        }
    }
}

@Composable
private fun TeacherStudentCard(student: Student) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(ThimarEmeraldContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = student.avatarLetter,
                        fontWeight = FontWeight.Bold,
                        color = ThimarEmeraldPrimary,
                        fontSize = 18.sp
                    )
                }

                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = student.name,
                            fontWeight = FontWeight.Bold,
                            color = ThimarTextPrimary,
                            fontSize = 15.sp
                        )
                        Surface(
                            color = ThimarSurfaceVariant,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = student.level,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = ThimarEmeraldDark
                            )
                        }
                    }
                    Text(
                        text = "آخر تسميع: ${student.lastSurah}",
                        color = ThimarTextMuted,
                        fontSize = 12.sp
                    )
                }
            }

            Text(
                text = "${student.progress}٪",
                fontWeight = FontWeight.Black,
                color = ThimarEmeraldPrimary,
                fontSize = 16.sp
            )
        }
    }
}

@Composable
private fun TeacherWeeklyStats() {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "إحصائيات الحلقة الأسبوعية",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = ThimarTextPrimary
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("نسبة الحضور والتسميع", color = ThimarTextSecondary)
                Text("٩٤٪", fontWeight = FontWeight.Bold, color = ThimarEmeraldPrimary)
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("أوسمة تم منحها للطلاب", color = ThimarTextSecondary)
                Text("١٢ وساماً", fontWeight = FontWeight.Bold, color = ThimarAmberAccent)
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("استخدام جلسات التدريب بالذكاء الاصطناعي", color = ThimarTextSecondary)
                Text("٨ ساعات", fontWeight = FontWeight.Bold, color = ThimarBlue)
            }
        }
    }
}

@Composable
private fun ParentChildrenSection() {
    var selectedChildIndex by remember { mutableStateOf(0) }
    val children = ThimarRepository.children
    val selectedChild = children.getOrNull(selectedChildIndex) ?: children.first()

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column {
            Text(
                text = "متابعة الأبناء في الحلقات",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = ThimarTextPrimary
            )
            Text(
                text = "لوحة أولياء الأمور لمتابعة الحفظ والتسميع",
                style = MaterialTheme.typography.bodyMedium,
                color = ThimarTextSecondary
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            children.forEachIndexed { index, child ->
                val isSelected = selectedChildIndex == index
                Card(
                    onClick = { selectedChildIndex = index },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) ThimarEmeraldPrimary else Color.White
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = child.name,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) Color.White else ThimarTextPrimary,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "${child.level} • ${child.teacher}",
                            fontSize = 11.sp,
                            color = if (isSelected) Color.White.copy(alpha = 0.8f) else ThimarTextMuted
                        )
                        Text(
                            text = "الإنجاز: ${child.progress}٪",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = if (isSelected) ThimarAmberLight else ThimarEmeraldPrimary
                        )
                    }
                }
            }
        }

        // Selected child details card
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "آخر نشاطات ${selectedChild.name}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = ThimarTextPrimary
                )

                ThimarRepository.activityLogs.forEach { log ->
                    Surface(
                        color = ThimarSurfaceVariant,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text(
                                    text = log.action,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    color = ThimarTextPrimary
                                )
                                Text(
                                    text = log.date,
                                    fontSize = 11.sp,
                                    color = ThimarTextMuted
                                )
                            }
                            Surface(
                                color = ThimarEmeraldContainer,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = log.status,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ThimarEmeraldDark
                                )
                            }
                        }
                    }
                }
            }
        }

        // Parent Tip Card
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = ThimarAmberAccent),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "نصيحة اليوم لولي الأمر",
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    fontSize = 16.sp
                )
                Text(
                    text = "«أفضل هدية تقدمها لطفلك هي تشجيعه اليومي بكلمات محفزة ومشاركته الاستماع إلى ورده القرآني قبل النوم.»",
                    color = Color.White.copy(alpha = 0.95f),
                    fontSize = 13.sp,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

@Composable
private fun AdminOverviewSection(onStartSession: () -> Unit) {
    val requests by ThimarRepository.joinRequests.collectAsState()

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Column {
            Text(
                text = "لوحة الإشراف العام",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = ThimarTextPrimary
            )
            Text(
                text = "متابعة طلبات الانضمام والجلسات المباشرة للمنصة",
                style = MaterialTheme.typography.bodyMedium,
                color = ThimarTextSecondary
            )
        }

        // Join Requests
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "طلبات الانضمام المعلقة",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = ThimarTextPrimary
                    )
                    Surface(
                        color = ThimarEmeraldPrimary,
                        shape = CircleShape
                    ) {
                        Text(
                            text = "${requests.size}",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    }
                }

                if (requests.isEmpty()) {
                    Text(
                        text = "لا توجد طلبات انضمام معلقة حالياً",
                        color = ThimarTextMuted,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                } else {
                    requests.forEach { req ->
                        Surface(
                            color = ThimarSurfaceVariant,
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                    Text(
                                        text = req.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = ThimarTextPrimary
                                    )
                                    Text(
                                        text = "${req.role} • ${req.date}",
                                        fontSize = 11.sp,
                                        color = ThimarTextMuted
                                    )
                                }

                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    IconButton(
                                        onClick = { ThimarRepository.rejectRequest(req.id) },
                                        modifier = Modifier.size(34.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Close,
                                            contentDescription = "رفض",
                                            tint = ThimarError
                                        )
                                    }
                                    IconButton(
                                        onClick = { ThimarRepository.approveRequest(req.id) },
                                        modifier = Modifier.size(34.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = "قبول",
                                            tint = ThimarEmeraldPrimary
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Live Sessions Card
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Videocam,
                    contentDescription = null,
                    tint = ThimarEmeraldPrimary,
                    modifier = Modifier.size(40.dp)
                )
                Text(
                    text = "غرفة الجلسات المباشرة",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = ThimarTextPrimary
                )
                Text(
                    text = "إشراف ومتابعة الغرف الصوتية والمرئية لحلقات التحفيظ",
                    style = MaterialTheme.typography.bodySmall,
                    color = ThimarTextSecondary
                )
                Button(
                    onClick = onStartSession,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThimarEmeraldPrimary)
                ) {
                    Text("فتح غرفة اتصال مباشرة", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
