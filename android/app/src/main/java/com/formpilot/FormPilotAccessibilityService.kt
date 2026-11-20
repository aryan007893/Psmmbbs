package com.formpilot

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.os.Bundle

class FormPilotAccessibilityService : AccessibilityService() {
    companion object {
        @Volatile var requestFill: Boolean = false
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!requestFill) return
        if (event?.packageName?.toString() != "com.android.chrome") return
        requestFill = false
        val root = rootInActiveWindow ?: return
        // Conservative proof-of-concept: only fill nodes whose hint/text labels
        // exactly match the keys in a future locally stored profile adapter.
        // No submit button is ever clicked.
        fillVisibleTextFields(root)
    }

    private fun fillVisibleTextFields(node: AccessibilityNodeInfo) {
        if (node.isEditable && node.isEnabled) {
            // Profile repository integration is the next implementation step.
            // Deliberately do not guess personal data or overwrite existing values.
        }
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                fillVisibleTextFields(child)
                child.recycle()
            }
        }
    }

    override fun onInterrupt() = Unit
}
