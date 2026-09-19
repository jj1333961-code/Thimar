package com.thimar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.ui.theme.*

data class ChatContact(
    val id: String,
    val name: String,
    val role: String,
    val lastMessage: String,
    val time: String,
    val unreadCount: Int = 0
)

data class DirectMessage(
    val id: String,
    val text: String,
    val isMe: Boolean,
    val time: String
)

@Composable
fun MessagesScreen() {
    val contacts = remember {
        listOf(
            ChatContact("1", "الشيخ أحمد علي", "معلم الحلقة", "بارك الله فيك يا ياسين، تسميع سورة النور كان متقناً.", "١٠:٤٥ ص", 1),
            ChatContact("2", "إدارة منصة ثمار", "الدعم الفني", "تم اعتماد طلب مشاركتكم في المسابقة القرآنية الشهرية.", "أمس", 0),
            ChatContact("3", "مجموعة حلقة النور", "حلقة التحفيظ", "موعد اللقاء الصباحي غداً الساعة السادسة صباحاً.", "منذ يومين", 0)
        )
    }

    var activeContact by remember { mutableStateOf<ChatContact?>(null) }
    var chatHistory by remember {
        mutableStateOf(
            listOf(
                DirectMessage("1", "السلام عليكم ورحمة الله وبركاته يا شيخنا", true, "١٠:٣٠ ص"),
                DirectMessage("2", "وعليكم السلام ورحمة الله وبركاته، أهلاً بك يا بني", false, "١٠:٣٥ ص"),
                DirectMessage("3", "لقد أتممت مراجعة الربع الثاني من سورة النور وسأرفع التسجيل اليوم", true, "١٠:٤٠ ص"),
                DirectMessage("4", "بارك الله فيك يا ياسين، تسميع سورة النور كان متقناً ودرجتك ٩٥٪.", false, "١٠:٤٥ ص")
            )
        )
    }
    var currentInput by remember { mutableStateOf("") }

    if (activeContact != null) {
        // Chat Thread View
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(ThimarBackground)
        ) {
            // Header
            Surface(
                color = Color.White,
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    IconButton(onClick = { activeContact = null }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "رجوع")
                    }

                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(ThimarEmeraldContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = activeContact!!.name.first().toString(),
                            fontWeight = FontWeight.Bold,
                            color = ThimarEmeraldPrimary
                        )
                    }

                    Column {
                        Text(
                            text = activeContact!!.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = ThimarTextPrimary
                        )
                        Text(
                            text = activeContact!!.role,
                            fontSize = 11.sp,
                            color = ThimarTextMuted
                        )
                    }
                }
            }

            // Message List
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(chatHistory) { msg ->
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = if (msg.isMe) Alignment.End else Alignment.Start
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (msg.isMe) ThimarEmeraldPrimary else Color.White,
                            shadowElevation = 1.dp
                        ) {
                            Text(
                                text = msg.text,
                                modifier = Modifier.padding(12.dp),
                                color = if (msg.isMe) Color.White else ThimarTextPrimary,
                                fontSize = 14.sp
                            )
                        }
                        Text(
                            text = msg.time,
                            fontSize = 10.sp,
                            color = ThimarTextMuted,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }

            // Input Bar
            Surface(
                color = Color.White,
                tonalElevation = 4.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = currentInput,
                        onValueChange = { currentInput = it },
                        placeholder = { Text("اكتب رسالتك...") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ThimarEmeraldPrimary
                        )
                    )

                    IconButton(
                        onClick = {
                            if (currentInput.isNotBlank()) {
                                chatHistory = chatHistory + DirectMessage(
                                    id = System.currentTimeMillis().toString(),
                                    text = currentInput.trim(),
                                    isMe = true,
                                    time = "الآن"
                                )
                                currentInput = ""
                            }
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .background(ThimarEmeraldPrimary, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = "إرسال",
                            tint = Color.White
                        )
                    }
                }
            }
        }
    } else {
        // Contacts List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(ThimarBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "الرسائل والمحادثات",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = ThimarTextPrimary
                    )
                    Text(
                        text = "تواصل مباشر مع معلمي الحلقة وإدارة المنصة",
                        style = MaterialTheme.typography.bodyMedium,
                        color = ThimarTextSecondary
                    )
                }
            }

            items(contacts) { contact ->
                Card(
                    onClick = { activeContact = contact },
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
                                    .size(48.dp)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(ThimarEmeraldContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = contact.name.first().toString(),
                                    fontWeight = FontWeight.Bold,
                                    color = ThimarEmeraldPrimary,
                                    fontSize = 20.sp
                                )
                            }

                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text(
                                    text = contact.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = ThimarTextPrimary
                                )
                                Text(
                                    text = contact.lastMessage,
                                    fontSize = 12.sp,
                                    color = ThimarTextSecondary,
                                    maxLines = 1
                                )
                            }
                        }

                        Column(
                            horizontalAlignment = Alignment.End,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = contact.time,
                                fontSize = 11.sp,
                                color = ThimarTextMuted
                            )
                            if (contact.unreadCount > 0) {
                                Surface(
                                    color = ThimarEmeraldPrimary,
                                    shape = CircleShape
                                ) {
                                    Text(
                                        text = "${contact.unreadCount}",
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
