package com.formpilot

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 48, 32, 32)
        }
        layout.addView(TextView(this).apply {
            text = "FormPilot\\n\\n1. Enable the accessibility service.\\n2. Open a Google Form in Chrome.\\n3. Use the Fill action in FormPilot.\\n4. Review the answers and submit yourself."
            textSize = 18f
        })
        layout.addView(Button(this).apply {
            text = "Open Accessibility Settings"
            setOnClickListener { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        })
        layout.addView(Button(this).apply {
            text = "Fill visible form in Chrome"
            setOnClickListener { FormPilotAccessibilityService.requestFill = true }
        })
        setContentView(layout)
    }
}
