using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor.UI;
using UnityEngine.UI;
using TMPro;
using UnityEngine.EventSystems;

public class ParticleUI : MonoBehaviour
{
    public int gridSize = 3; // Number of rows and columns
    public TMP_InputField textBoxPrefab;
    public AdjustableParticleManager particleManager; // Reference to AdjustableParticleManager script

    [Header("Force Matrix")]
    public float fm_scrollSpeed = 1f; // Adjust this value based on the desired scroll sensitivity
    public RectTransform fm_Panel;

    [Header("Conversion Matrix")]
    public float cm_scrollSpeed = 1f; // Adjust this value based on the desired scroll sensitivity
    public RectTransform cm_Panel;

    private TMP_InputField[,] textBoxArray;
    private float[,] textBoxValues;

    void Start()
    {
        gridSize = particleManager.m;
        print(particleManager.forceMatrix);
        CreateTextBoxArray();
    }

    void CreateTextBoxArray()
    {
        textBoxArray = new TMP_InputField[gridSize, gridSize];
        textBoxValues = new float[gridSize, gridSize];

        float spacing = 10f;

        // Calculate panel size based on gridSize
        float panelSize = Mathf.Min(fm_Panel.rect.width, fm_Panel.rect.height);

        // Calculate individual text box size to maximize space
        float textBoxSize = (panelSize - (gridSize - 1) * spacing) / gridSize;

        // Calculate starting position based on panel size and text box size
        float startX = -panelSize / 2 + textBoxSize / 2;
        float startY = panelSize / 2 - textBoxSize / 2;

        for (int i = 0; i < gridSize; i++)
        {
            for (int j = 0; j < gridSize; j++)
            {
                TMP_InputField textBoxGO = Instantiate(textBoxPrefab, fm_Panel);
                textBoxGO.name = "TextBox_" + i + "_" + j;

                RectTransform rectTransform = textBoxGO.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(startX + j * (textBoxSize + spacing), startY - i * (textBoxSize + spacing));
                rectTransform.sizeDelta = new Vector2(textBoxSize, textBoxSize);

                textBoxGO.pointSize = Mathf.RoundToInt(textBoxSize / 2.5f); // Scale text size based on the textBoxSize

                textBoxArray[i, j] = textBoxGO;

                UpdateTextBoxValue(i, j, (particleManager.forceMatrix[i, j] / 100).ToString());
                textBoxArray[i, j].text = textBoxValues[i, j].ToString();

                // Add a listener to update the value when it changes
                int row = i;
                int col = j;
                UpdateTextColor(row, col);
                textBoxGO.onValueChanged.AddListener((value) => UpdateTextBoxValue(row, col, value));

                // Add colored blocks on the top of each column and left of each row
                if (i == 0)
                {
                    // Create colored block for the top of each column
                    Image topBlock = new GameObject("TopBlock_" + j).AddComponent<Image>();
                    topBlock.transform.SetParent(fm_Panel);
                    topBlock.color = Color.HSVToRGB(((float)j / gridSize), 1, 1);
                    RectTransform topBlockRect = topBlock.GetComponent<RectTransform>();
                    topBlockRect.anchoredPosition = new Vector2(startX + j * (textBoxSize + spacing), startY + textBoxSize / 2 + spacing);
                    topBlockRect.sizeDelta = new Vector2(textBoxSize, spacing);
                }

                if (j == 0)
                {
                    // Create colored block for the left of each row
                    Image leftBlock = new GameObject("LeftBlock_" + i).AddComponent<Image>();
                    leftBlock.transform.SetParent(fm_Panel);
                    leftBlock.color = Color.HSVToRGB(((float)i / gridSize), 1, 1);
                    RectTransform leftBlockRect = leftBlock.GetComponent<RectTransform>();
                    leftBlockRect.anchoredPosition = new Vector2(startX - textBoxSize / 2 - spacing, startY - i * (textBoxSize + spacing));
                    leftBlockRect.sizeDelta = new Vector2(spacing, textBoxSize);
                }

                // Add a listener to handle mouse wheel scrolling
                EventTrigger trigger = textBoxGO.gameObject.AddComponent<EventTrigger>();
                EventTrigger.Entry entry = new EventTrigger.Entry { eventID = EventTriggerType.Scroll };
                entry.callback.AddListener((data) => { OnScroll(data, row, col, fm_scrollSpeed); });
                trigger.triggers.Add(entry);
            }
        }
    }

    void UpdateTextBoxValue(int row, int col, string value)
    {
        if (float.TryParse(value, out float floatValue))
        {
            // Clamp the values between -100 and 100
            textBoxValues[row, col] = Mathf.Clamp(floatValue, -1f, 1f);

            // Update the text color based on the clamped value
            UpdateTextColor(row, col);

            // Update the forceMatrix in the AdjustableParticleManager script
            particleManager.UpdateForceMatrix(row, col, textBoxValues[row, col]);
        }
    }

    void OnScroll(BaseEventData eventData, int row, int col, float scrollSpeed)
    {
        // Handle mouse wheel scrolling to change the value of the square
        PointerEventData pointerEventData = eventData as PointerEventData;
        float scrollDelta = pointerEventData.scrollDelta.y;
        textBoxValues[row, col] += scrollDelta * scrollSpeed;

        // Clamp the values between -100 and 100
        textBoxValues[row, col] = Mathf.Clamp(textBoxValues[row, col], -1f, 1f);

        // Update the text field and the text color based on the clamped value
        textBoxArray[row, col].text = textBoxValues[row, col].ToString();
        UpdateTextColor(row, col);

        // Update the forceMatrix in the AdjustableParticleManager script
        particleManager.UpdateForceMatrix(row, col, textBoxValues[row, col]);
    }

    void UpdateTextColor(int row, int col)
    {
        // Update the image color based on the value
        float normalizedValue = Mathf.InverseLerp(-1f, 1f, textBoxValues[row, col]);

        // Define the color points for the transition (red to black to green)
        Color redColor = Color.red;
        Color blackColor = Color.black;
        Color greenColor = Color.green;

        // Determine the thresholds for transitioning from red to black and from black to green
        float blackThreshold = 0.5f; // Adjust this value to control where black starts

        // Perform the color transition
        Color targetColor;
        if (normalizedValue < blackThreshold)
        {
            // Transition from red to black
            float t = Mathf.InverseLerp(0f, blackThreshold, normalizedValue);
            targetColor = Color.Lerp(greenColor, blackColor, t);
        }
        else
        {
            // Transition from black to green
            float t = Mathf.InverseLerp(blackThreshold, 1f, normalizedValue);
            targetColor = Color.Lerp(blackColor, redColor, t);
        }

        targetColor.a = 0.5f;

        // Update the image color
        Image image = textBoxArray[row, col].GetComponent<Image>();
        if (image != null)
        {
            image.color = targetColor;
        }
    }

    public float[,] GetTextBoxValues()
    {
        return textBoxValues;
    }
}