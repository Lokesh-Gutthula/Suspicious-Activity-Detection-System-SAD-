import os
from collections import defaultdict


def get_class_id_counts(label_folder):
    """
    Counts the occurrences of each class ID in the specified folder.

    Args:
        label_folder (str): Path to the folder containing label files.

    Returns:
        dict: A dictionary with class IDs as keys and their counts as values.
    """
    class_id_counts = defaultdict(int)

    for label_file in os.listdir(label_folder):
        if label_file.endswith('.txt'):  # Only process .txt files
            label_path = os.path.join(label_folder, label_file)

            with open(label_path, 'r') as file:
                for line in file:
                    # Split each line and extract the class ID (first value in YOLO format)
                    parts = line.strip().split()
                    if parts:  # Ensure line is not empty
                        class_id = int(parts[0])  # Convert class ID to integer
                        # Increment the count for this class ID
                        class_id_counts[class_id] += 1

    # Convert defaultdict to a regular dict for output
    return dict(class_id_counts)


# Example usage
folders = [
    "C:/Users/Dad's Lovely Son/Downloads/glass window.v1i.yolov8/train/labels",
    "C:/Users/Dad's Lovely Son/Downloads/glass window.v1i.yolov8/test/labels",
    "C:/Users/Dad's Lovely Son/Downloads/glass window.v1i.yolov8/valid/labels"
]

for folder in folders:
    class_id_counts = get_class_id_counts(folder)
    print(f"Class ID counts for folder {folder}: {class_id_counts}")
