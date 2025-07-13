import cv2

# 📸 Replace with the IP shown in your IP Webcam app
camera_url = 'http://192.168.137.1:8080/video'  # Example IP

# Open connection to camera stream
cap = cv2.VideoCapture(camera_url)

if not cap.isOpened():
    print("❌ Could not open camera stream. Check the URL and network.")
    exit()

print("✅ Camera stream started. Press 'q' to stop.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Failed to grab frame. Exiting...")
        break

    # Show frame in window
    cv2.imshow("📷 Android Phone Camera", frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("👋 Exiting camera stream.")
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
