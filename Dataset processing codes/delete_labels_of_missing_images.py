import os

images_folder = "C:/Users/Dad's Lovely Son/Downloads/CrimeDetection.v1i.yolov8/train/images"
labels_folder = "C:/Users/Dad's Lovely Son/Downloads/CrimeDetection.v1i.yolov8/train/labels"

# Check the current working directory for debugging
print("Current working directory:", os.getcwd())

# Get the list of image files (e.g., .jpg, .jpeg, .png)
if os.path.exists(images_folder):
    image_files = set(os.listdir(images_folder))
else:
    print(f"Error: Images folder '{images_folder}' does not exist.")
    exit(1)

# Iterate through all label files in the labels folder
if os.path.exists(labels_folder):
    for label_filename in os.listdir(labels_folder):
        # Process only .txt files
        if label_filename.endswith(".txt"):
            # Get the base filename without extension (i.e., filename without .txt)
            base_filename = os.path.splitext(label_filename)[0]

            # Check if the corresponding image file exists
            corresponding_image_files = [ext for ext in [
                '.jpg', '.jpeg', '.png'] if base_filename + ext in image_files]

            if not corresponding_image_files:
                # If no corresponding image file is found, delete the label file
                label_file_path = os.path.join(labels_folder, label_filename)
                os.remove(label_file_path)
                print(
                    f"Deleted {label_filename}, no corresponding image found.")
else:
    print(f"Error: Labels folder '{labels_folder}' does not exist.")
    exit(1)

print("Completed checking for missing images and deleting label files.")
