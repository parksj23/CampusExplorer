export class Course {
    private coursesDept: string;
    private coursesId: string;
    private coursesAvg: number;
    private coursesInstructor: string;
    private coursesTitle: string;
    private coursesPass: number;
    private coursesFail: number;
    private coursesAudit: number;
    private coursesUuid: string;
    private coursesYear: number;


    public constructor(avg: number, pass: number, fail: number, audit: number, year: number, dept: string,
                       id: string, instructor: string, title: string, uuid: string) {
        this.coursesAvg = avg;
        this.coursesPass = pass;
        this.coursesFail = fail;
        this.coursesAudit = audit;
        this.coursesYear = year;
        this.coursesDept = dept;
        this.coursesId = id;
        this.coursesInstructor = instructor;
        this.coursesTitle = title;
        this.coursesUuid = uuid;
    }


    public get getDept(): string {
        return this.coursesDept;
    }
    
    public set setDept(value: string) {
        this.coursesDept = value;
    }

    public get getID(): string {
        return this.coursesId;
    }
    
    public set setID(value: string) {
        this.coursesId = value;
    }

    public get getAvg(): number {
        return this.coursesAvg;
    }
    
    public set setAvg(value: number) {
        this.coursesAvg = value;
    }

    public get getInstructor(): string {
        return this.coursesInstructor;
    }
    
    public set setInstructor(value: string) {
        this.coursesInstructor = value;
    }

    public get getTitle(): string {
        return this.coursesTitle;
    }
    
    public set setTitle(value: string) {
        this.coursesTitle = value;
    }

    public get getPass(): number {
        return this.coursesPass;
    }
    
    public set setPass(value: number) {
        this.coursesPass = value;
    }

    public get getFail(): number {
        return this.coursesFail;
    }
    
    public set setFail(value: number) {
        this.coursesFail = value;
    }

    public get getAudit(): number {
        return this.coursesAudit;
    }
    
    public set setAudit(value: number) {
        this.coursesAudit = value;
    }

    public get getUUID(): string {
        return this.coursesUuid;
    }
    
    public set setUUID(value: string) {
        this.coursesUuid = value;
    }

    public get getYear(): number {
        return this.coursesYear;
    }
    
    public set setYear(value: number) {
        this.coursesYear = value;
    }

}
