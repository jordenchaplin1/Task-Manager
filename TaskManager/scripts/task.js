class Task {
    constructor (title, description, color, date, status, budget) {
        this.title = title;
        this.desc = description
        this.color = color;
        this.date = date;
        this.status = status;
        this.budget = budget;
        //2. Create an Object using our Class
        const taskToSave = new Task(title,this.desc,color,date,status,budget);
    }
}
function init(){
    console.log("hello from ch72");
}

window.onload = init;