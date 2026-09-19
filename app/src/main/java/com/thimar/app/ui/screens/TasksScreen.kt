package com.thimar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.thimar.app.data.ThimarRepository
import com.thimar.app.model.TaskItem
import com.thimar.app.model.TaskStatus
import com.thimar.app.model.TaskType
import com.thimar.app.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun TasksScreen(
    onStartRecitation: () -> Unit
) {
    val tasks by ThimarRepository.tasks.collectAsState()
    var selectedTypeFilter by remember { mutableStateOf<TaskType?>(null) }
    var selectedStatusFilter by remember { mutableStateOf<TaskStatus?>(null) }
    var activeModalTask by remember { mutableStateOf<TaskItem?>(null) }

    val filteredTasks = tasks.filter { task ->
        (selectedTypeFilter == null || task.type == selectedTypeFilter) &&
        (selectedStatusFilter == null || task.status == selectedStatusFilter)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ThimarBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Top Header
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "المهام والتكاليف القرآنية",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = ThimarTextPrimary
                )
                Text(
                    text = "متابعة التسميع اليومي، الاختبارات والواجبات المطلوبة",
                    style = MaterialTheme.typography.bodyMedium,
                    color = ThimarTextSecondary
                )
            }
        }

        // Type Filter Chips
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = selectedTypeFilter == null,
                    onClick = { selectedTypeFilter = null },
                    label = { Text("الكل") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = ThimarEmeraldPrimary,
                        selectedLabelColor = Color.White
                    )
                )

                TaskType.values().forEach { type ->
                    FilterChip(
                        selected = selectedTypeFilter == type,
                        onClick = { selectedTypeFilter = type },
                        label = { Text(type.labelAr) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = ThimarEmeraldPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        // Status Tabs
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val statuses = listOf(
                    null to "جميع الحالات",
                    TaskStatus.NEW to "جديد",
                    TaskStatus.IN_PROGRESS to "قيد الإنجاز",
                    TaskStatus.COMPLETED to "مكتمل"
                )

                statuses.forEach { (status, label) ->
                    val isSelected = selectedStatusFilter == status
                    Surface(
                        onClick = { selectedStatusFilter = status },
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) ThimarEmeraldContainer else Color.White,
                        border = androidx.compose.foundation.BorderStroke(
                            1.dp,
                            if (isSelected) ThimarEmeraldPrimary else ThimarBorder
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = label,
                            modifier = Modifier.padding(vertical = 8.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) ThimarEmeraldDark else ThimarTextSecondary
                        )
                    }
                }
            }
        }

        // Tasks List
        if (filteredTasks.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "لا توجد مهام تطابق هذا التصفية",
                            color = ThimarTextMuted,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        } else {
            items(filteredTasks) { task ->
                TaskCard(
                    task = task,
                    onActionClick = {
                        if (task.type == TaskType.RECITATION) {
                            onStartRecitation()
                        } else {
                            activeModalTask = task
                        }
                    }
                )
            }
        }
    }

    activeModalTask?.let { task ->
        TaskSubmissionDialog(
            task = task,
            onDismiss = { activeModalTask = null },
            onSubmit = {
                ThimarRepository.completeTask(task.id)
                activeModalTask = null
            }
        )
    }
}

@Composable
private fun TaskCard(
    task: TaskItem,
    onActionClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
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
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val (typeBg, typeText) = when (task.type) {
                        TaskType.RECITATION -> ThimarEmeraldContainer to ThimarEmeraldDark
                        TaskType.EXAM -> Color(0xFFFEF2F2) to Color(0xFF991B1B)
                        TaskType.HOMEWORK -> Color(0xFFEFF6FF) to Color(0xFF1E40AF)
                        TaskType.ACTIVITY -> ThimarAmberContainer to ThimarAmberOnContainer
                    }
                    Surface(
                        color = typeBg,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = task.type.labelAr,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = typeText
                        )
                    }

                    if (task.score != null) {
                        Surface(
                            color = ThimarEmeraldContainer,
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "الدرجة: ${task.score}",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                color = ThimarEmeraldPrimary
                            )
                        }
                    }
                }

                Surface(
                    color = when (task.status) {
                        TaskStatus.NEW -> Color(0xFFEFF6FF)
                        TaskStatus.IN_PROGRESS -> ThimarAmberContainer
                        TaskStatus.COMPLETED, TaskStatus.GRADED -> ThimarEmeraldContainer
                    },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = task.status.labelAr,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = when (task.status) {
                            TaskStatus.NEW -> Color(0xFF1D4ED8)
                            TaskStatus.IN_PROGRESS -> ThimarAmberOnContainer
                            TaskStatus.COMPLETED, TaskStatus.GRADED -> ThimarEmeraldDark
                        }
                    )
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = ThimarTextPrimary
                )
                Text(
                    text = task.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = ThimarTextSecondary,
                    lineHeight = 20.sp
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Schedule,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = ThimarTextMuted
                    )
                    Text(
                        text = task.deadline,
                        color = ThimarTextMuted,
                        fontSize = 12.sp
                    )
                }

                Button(
                    onClick = onActionClick,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (task.status == TaskStatus.COMPLETED) ThimarEmeraldContainer else ThimarEmeraldPrimary,
                        contentColor = if (task.status == TaskStatus.COMPLETED) ThimarEmeraldDark else Color.White
                    ),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (task.status == TaskStatus.COMPLETED) "تم الإنجاز ✓" else "بدء المهمة",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun TaskSubmissionDialog(
    task: TaskItem,
    onDismiss: () -> Unit,
    onSubmit: () -> Unit
) {
    var notes by remember { mutableStateOf("") }
    var isRecording by remember { mutableStateOf(false) }
    var recordingSeconds by remember { mutableStateOf(0) }

    LaunchedEffect(isRecording) {
        if (isRecording) {
            while (isRecording) {
                delay(1000)
                recordingSeconds++
            }
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color.White,
            modifier = Modifier.fillMaxWidth(0.95f)
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
                    Text(
                        text = "تسليم المهمة",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = ThimarTextPrimary
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "إغلاق")
                    }
                }

                Text(
                    text = task.title,
                    fontWeight = FontWeight.SemiBold,
                    color = ThimarEmeraldDark,
                    fontSize = 14.sp
                )

                // Voice Recording Module
                Surface(
                    color = ThimarSurfaceVariant,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = if (isRecording) "جاري التسجيل الصوتي... 00:${String.format("%02d", recordingSeconds)}" else "تسجيل تلاوة أو إجابة صوتية",
                            fontWeight = FontWeight.Bold,
                            color = if (isRecording) ThimarError else ThimarTextPrimary,
                            fontSize = 13.sp
                        )

                        IconButton(
                            onClick = { isRecording = !isRecording },
                            modifier = Modifier
                                .size(56.dp)
                                .background(if (isRecording) ThimarError else ThimarEmeraldPrimary, CircleShape)
                        ) {
                            Icon(
                                imageVector = if (isRecording) Icons.Default.Stop else Icons.Default.Mic,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                }

                // Notes Field
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("ملاحظات إضافية للمعلم") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    minLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ThimarEmeraldPrimary
                    )
                )

                Button(
                    onClick = onSubmit,
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ThimarEmeraldPrimary),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("إرسال التسليم الآن", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
