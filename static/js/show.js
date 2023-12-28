$(document).ready(function() {
    $(".onlineStatus").each(function() {
        var status = $(this).text();
        if (status === "True") {
          $(this).css("color", "green");
        } else if (status === "False") {
          $(this).css("color", "red");
        }
        // Add more conditions for other status values as needed
      });
    const backButton = document.getElementById("backButton");
    if (backButton !== null){
        backButton.addEventListener("click", function() {
        history.back();
        });
    }  
});        

document.addEventListener("DOMContentLoaded", function() {
  var rows = document.querySelectorAll("table tr");
  var serialNumber = 1; // Initialize the serial number counter

  // Loop through each row starting from index 1 (skip header row)
  for (var i = 1; i < rows.length; i++) {
      var cell = document.createElement("td"); // Create a new cell
      cell.textContent = serialNumber++; // Set the serial number and increment
      rows[i].insertBefore(cell, rows[i].firstChild); // Insert cell as the first column
  }
});