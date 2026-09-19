package com.thimar.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.thimar.app.ui.theme.*

data class SurahReport(
    val name: String,
    val date: String,
    val grade: String,
    val notes: String
)

@Composable
fun ReportsScreen() {
    val surahReports = listOf(
        SurahReport("سورة النور (١ - ٢٠)", "اليوم", "٩٥٪", "تطبيق ممتاز لأحكام المدود"),
        SurahReport("سورة المؤمنون (كاملة)", "منذ أسبوع", "٩٨٪", "حفظ متقن ومخارج سليمة"),
        SurahReport("سورة الحج (١ - ٤٠)", "منذ أسبوعين", "٩٢٪", "انتبه لضبط المتشابهات اللفظية"),
        SurahReport("سورة الأنبياء (كاملة)", "منذ ٣ أسابيع", "٩٦٪", "تلاوة خاشعة وترتيل مبارك")
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ThimarBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "تقارير الإنجاز والدرجات",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = ThimarTextPrimary
                )
                Text(
                    text = "ملخص شامل لمسيرة الحفظ والتسميع والتجويد",
                    style = MaterialTheme.typography.bodyMedium,
                    color = ThimarTextSecondary
                )
            }
        }

        // Summary Metric Cards (2x2 Grid)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "الأجزاء المحفوظة", color = ThimarTextMuted, fontSize = 11.sp)
                        Text(text = "٢٤ جزءاً", fontWeight = FontWeight.Black, fontSize = 22.sp, color = ThimarEmeraldPrimary)
                        Text(text = "باقي ٦ أجزاء للختم", color = ThimarTextSecondary, fontSize = 10.sp)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "معدل التسميع", color = ThimarTextMuted, fontSize = 11.sp)
                        Text(text = "٩٦٪", fontWeight = FontWeight.Black, fontSize = 22.sp, color = ThimarAmberAccent)
                        Text(text = "تقدير: ممتاز جداً", color = ThimarTextSecondary, fontSize = 10.sp)
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "الانضباط والحضور", color = ThimarTextMuted, fontSize = 11.sp)
                        Text(text = "٩٨٪", fontWeight = FontWeight.Black, fontSize = 22.sp, color = ThimarBlue)
                        Text(text = "التزام تام بالمواعيد", color = ThimarTextSecondary, fontSize = 10.sp)
                    }
                }

                Card(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(text = "الأوسمة والشهادات", color = ThimarTextMuted, fontSize = 11.sp)
                        Text(text = "٨ أوسمة", fontWeight = FontWeight.Black, fontSize = 22.sp, color = ThimarEmeraldDark)
                        Text(text = "شهادة إتمام متن الجمزوري", color = ThimarTextSecondary, fontSize = 10.sp)
                    }
                }
            }
        }

        // Surah Evaluations
        item {
            Text(
                text = "سجل التسميع والتقييمات الأخيرة",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = ThimarTextPrimary
            )
        }

        items(surahReports) { report ->
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
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = report.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = ThimarTextPrimary
                        )
                        Text(
                            text = report.notes,
                            fontSize = 12.sp,
                            color = ThimarTextSecondary
                        )
                        Text(
                            text = report.date,
                            fontSize = 11.sp,
                            color = ThimarTextMuted
                        )
                    }

                    Surface(
                        color = ThimarEmeraldContainer,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = report.grade,
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            color = ThimarEmeraldDark,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }
    }
}
