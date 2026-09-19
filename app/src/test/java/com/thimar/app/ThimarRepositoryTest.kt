package com.thimar.app

import com.thimar.app.data.ThimarRepository
import com.thimar.app.model.TaskStatus
import com.thimar.app.model.UserRole
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ThimarRepositoryTest {

    @Test
    fun testRoleSwitch() {
        ThimarRepository.setRole(UserRole.TEACHER)
        assertEquals(UserRole.TEACHER, ThimarRepository.currentRole.value)

        ThimarRepository.setRole(UserRole.STUDENT)
        assertEquals(UserRole.STUDENT, ThimarRepository.currentRole.value)
    }

    @Test
    fun testCompleteTask() {
        val initialTask = ThimarRepository.tasks.value.first()
        ThimarRepository.completeTask(initialTask.id)

        val updatedTask = ThimarRepository.tasks.value.find { it.id == initialTask.id }
        assertEquals(TaskStatus.COMPLETED, updatedTask?.status)
    }

    @Test
    fun testAiMessageResponse() {
        val initialCount = ThimarRepository.chatMessages.value.size
        ThimarRepository.sendAiMessage("ما هي أحكام التجويد؟")

        val newMessages = ThimarRepository.chatMessages.value
        assertEquals(initialCount + 2, newMessages.size)
        assertTrue(newMessages.last().text.contains("أحكام التجويد"))
    }
}
