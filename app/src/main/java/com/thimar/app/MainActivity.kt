package com.thimar.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.audio.ThimarAudioPlayer
import com.thimar.app.data.ThimarRepository
import com.thimar.app.ui.components.AiChatDialog
import com.thimar.app.ui.components.AiChatFloatingButton
import com.thimar.app.ui.components.ThimarBottomNav
import com.thimar.app.ui.components.ThimarTab
import com.thimar.app.ui.components.ThimarTopBar
import com.thimar.app.ui.screens.*
import com.thimar.app.ui.theme.ThimarBackground
import com.thimar.app.ui.theme.ThimarEmeraldPrimary
import com.thimar.app.ui.theme.ThimarTextPrimary
import com.thimar.app.ui.theme.ThimarTheme

class MainActivity : ComponentActivity() {
    private lateinit var audioPlayer: ThimarAudioPlayer

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        audioPlayer = ThimarAudioPlayer(this)

        setContent {
            CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                ThimarTheme {
                    ThimarMainApp(audioPlayer = audioPlayer)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        audioPlayer.stop()
    }
}

@Composable
fun ThimarMainApp(audioPlayer: ThimarAudioPlayer) {
    val currentRole by ThimarRepository.currentRole.collectAsState()
    var currentTab by remember { mutableStateOf(ThimarTab.HOME) }
    var showAiChat by remember { mutableStateOf(false) }
    var showLiveRecitation by remember { mutableStateOf(false) }
    var showInfoDialog by remember { mutableStateOf(false) }

    if (showLiveRecitation) {
        LiveRecitationScreen(onClose = { showLiveRecitation = false })
    } else {
        Scaffold(
            topBar = {
                ThimarTopBar(
                    currentRole = currentRole,
                    onRoleSelected = { ThimarRepository.setRole(it) },
                    onInfoClick = { showInfoDialog = true }
                )
            },
            bottomBar = {
                ThimarBottomNav(
                    currentTab = currentTab,
                    onTabSelected = { currentTab = it }
                )
            },
            floatingActionButton = {
                if (currentTab != ThimarTab.MESSAGES) {
                    AiChatFloatingButton(onClick = { showAiChat = true })
                }
            },
            containerColor = ThimarBackground
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (currentTab) {
                    ThimarTab.HOME -> {
                        HomeScreen(
                            currentRole = currentRole,
                            audioPlayer = audioPlayer,
                            onStartLiveRecitation = { showLiveRecitation = true },
                            onNavigateToQuran = { currentTab = ThimarTab.QURAN },
                            onNavigateToTasks = { currentTab = ThimarTab.TASKS }
                        )
                    }
                    ThimarTab.QURAN -> {
                        QuranReaderScreen(audioPlayer = audioPlayer)
                    }
                    ThimarTab.TAJWEED -> {
                        TuhfatAlAtfalScreen(audioPlayer = audioPlayer)
                    }
                    ThimarTab.TASKS -> {
                        TasksScreen(onStartRecitation = { showLiveRecitation = true })
                    }
                    ThimarTab.MESSAGES -> {
                        MessagesScreen()
                    }
                    ThimarTab.REPORTS -> {
                        ReportsScreen()
                    }
                }
            }
        }
    }

    if (showAiChat) {
        AiChatDialog(onDismiss = { showAiChat = false })
    }

    if (showInfoDialog) {
        AlertDialog(
            onDismissRequest = { showInfoDialog = false },
            confirmButton = {
                TextButton(onClick = { showInfoDialog = false }) {
                    Text("فهمت، بارك الله فيكم", color = ThimarEmeraldPrimary, fontWeight = FontWeight.Bold)
                }
            },
            title = {
                Text("منصة ثمار | القرآن والتعليم", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    text = "ثمار هي منصة إسلامية متكاملة لتعليم القرآن الكريم وأحكام التجويد، توفر بيئة تفاعلية للطالب والمعلم وولي الأمر والمسؤول، مدعومة بمساعد قرآني ذكي، مصحف شريف مرتل، ومتن تحفة الأطفال.",
                    lineHeight = 22.sp,
                    color = ThimarTextPrimary
                )
            },
            shape = RoundedCornerShape(20.dp)
        )
    }
}
