package com.thimar.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.ui.theme.ThimarAmberAccent
import com.thimar.app.ui.theme.ThimarEmeraldLight
import com.thimar.app.ui.theme.ThimarEmeraldPrimary
import kotlinx.coroutines.delay

@Composable
fun LiveRecitationScreen(
    onClose: () -> Unit
) {
    var isMuted by remember { mutableStateOf(false) }
    var isCameraOff by remember { mutableStateOf(false) }
    var mode by remember { mutableStateOf<"ai" | "teacher">("ai") }
    var currentFeedback by remember { mutableStateOf("ابدأ التلاوة، الذكاء الاصطناعي يحلل التجويد ومخارج الحروف مباشرة") }
    var transcription by remember { mutableStateOf("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ") }

    // Waveform animation
    val infiniteTransition = rememberInfiniteTransition(label = "wave")
    val waveScale by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    // Periodic simulation of AI feedback
    LaunchedEffect(Unit) {
        val feedbackList = listOf(
            "تنبيه: انتبه لمد الياء العارض للسكون في 'الرَّحِيمِ'",
            "أحسنت: إظهار حلقي متقن لحرف النون",
            "ممتاز: ترقيق الراء المكسورة سليم",
            "ملحوظة: اضبط زمن الغنة في الميم المشددة بمقدار حركتين"
        )
        var index = 0
        while (true) {
            delay(5000)
            currentFeedback = feedbackList[index % feedbackList.size]
            index++
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0D1117))
            .systemBarsPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onClose,
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color.White.copy(alpha = 0.1f), CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "إنهاء الجلسة",
                        tint = Color.White
                    )
                }

                Surface(
                    color = Color.White.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(ThimarEmeraldLight)
                        )
                        Text(
                            text = if (mode == "ai") "جلسة تسميع ذكية - ثمار AI" else "جلسة مباشرة مع الشيخ أحمد",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                // Switch mode
                TextButton(
                    onClick = { mode = if (mode == "ai") "teacher" else "ai" }
                ) {
                    Text(
                        text = if (mode == "ai") "طلب المعلم" else "العودة للـ AI",
                        color = ThimarAmberAccent,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }

            // Center Visualizer Area
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp),
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                // Glow Circle
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                listOf(
                                    ThimarEmeraldPrimary.copy(alpha = 0.5f),
                                    Color.Transparent
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(110.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    listOf(ThimarEmeraldPrimary, Color(0xFF0F766E))
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (mode == "ai") Icons.Default.Psychology else Icons.Default.Person,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(54.dp)
                        )
                    }
                }

                // Waveform Audio Bars
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.height(48.dp)
                ) {
                    val barHeights = listOf(0.4f, 0.7f, 1.0f, 0.8f, 0.5f, 0.9f, 0.6f, 1.0f, 0.4f)
                    barHeights.forEach { factor ->
                        val currentHeight = if (isMuted) 6.dp else (40 * factor * waveScale).coerceAtLeast(6f).dp
                        Box(
                            modifier = Modifier
                                .width(6.dp)
                                .height(currentHeight)
                                .clip(RoundedCornerShape(3.dp))
                                .background(if (isMuted) Color.Gray else ThimarEmeraldLight)
                        )
                    }
                }

                // Recitation transcription preview
                Surface(
                    color = Color.White.copy(alpha = 0.08f),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "النص المقروء الآن:",
                            color = Color.White.copy(alpha = 0.6f),
                            fontSize = 11.sp
                        )
                        Text(
                            text = transcription,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }

                // Live AI Feedback Chip
                Surface(
                    color = ThimarEmeraldContainer,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = ThimarEmeraldPrimary,
                            modifier = Modifier.size(22.dp)
                        )
                        Text(
                            text = currentFeedback,
                            color = ThimarEmeraldDark,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            lineHeight = 18.sp
                        )
                    }
                }
            }

            // Bottom Control Actions
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Mic Button
                IconButton(
                    onClick = { isMuted = !isMuted },
                    modifier = Modifier
                        .size(56.dp)
                        .background(
                            if (isMuted) Color.Red.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.15f),
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                        contentDescription = "المايك",
                        tint = if (isMuted) Color.Red else Color.White
                    )
                }

                // End Call
                Button(
                    onClick = onClose,
                    shape = CircleShape,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
                    modifier = Modifier.size(68.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CallEnd,
                        contentDescription = "إنهاء",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }

                // Camera Toggle
                IconButton(
                    onClick = { isCameraOff = !isCameraOff },
                    modifier = Modifier
                        .size(56.dp)
                        .background(
                            if (isCameraOff) Color.Red.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.15f),
                            CircleShape
                        )
                ) {
                    Icon(
                        imageVector = if (isCameraOff) Icons.Default.VideocamOff else Icons.Default.Videocam,
                        contentDescription = "الكاميرا",
                        tint = if (isCameraOff) Color.Red else Color.White
                    )
                }
            }
        }
    }
}
