define(['zepto'], function($) {

    var ip = "https://dove-rest-dev.hnair.net:9600";
    // var ip = "https://dove-rest-dev.hnair.net:9601";
    // var ip = "https://dove-rest.hnair.net";
    var OpenAPI = {
        "isLocal": false,
        "dataType": "JSON",
        "pageSize": 10,
        "access_token": ip + "/action/openapi/token",
        "clear_notice": ip + "/action/openapi/clear_notice",

        //用户登录
        "login": ip + "/EBT/rest/user/login.json",
        
        //用户详细信息
        "userDetailInfo": ip + "/EBT/rest/user/get_userdetail.json",

        //课程列表查询
        "courseListInfo": ip + "/EBT/rest/lesson/query_lessons.json",
        
        //课程明细查询
        "courseDetailInfo": ip + "/EBT/rest/lesson/query_lesson_detail.json",
        
        //已完成课程查询
        "completeCourseList": ip + "/EBT/rest/lesson/query_finished_lessons.json",
        
        //评分信息上传
        "scoreUpload": ip + "/EBT/rest/score/score_upload.json",
        
        //评分详细信息查询
        "queryLessonScore": ip + "/EBT/rest/score/query_lesson_score.json",
        
        //能力分析查询
        "getUserAbility": ip + "/EBT/rest/tool/get_user_ability.json",
        
        //课程反馈
        "newFeedback": ip + "/EBT/rest/feedback/new_feedback.json",
        
        //反馈信息查询
        "queryFeedbacks": ip + "/EBT/rest/feedback/query_feedbacks.json",
        //验证学员是否存在
        "exists": ip + "/EBT/rest/user/exists.json",


    };

    var OpenAPI_local = {
        "dataType": "JSON",
        "pageSize": 10,
        "login": "../template/login_temp.js",
        "allCourse": "../template/allCourse_temp.js",
        "guidedCourse_template": "../template/guidedCourse_data.json",
        "coursePage_template": '../template/coursePage_temp.js',
        "ResultsUpload_template": "../template/ResultsUpload_temp.js",
        "completeCourse_template": "../template/completeCourse_data.json",
        "trainResult": "../template/trainResult_temp.js",
        "courseDetailInfo": "../template/courseDetailInfo.json",
        "participationQuery_template": "../template/participationQuery_data.json",
        "guidedResultPage_template": "../template/guidedResultPage_data.json",
        "completeResultPage_template": "../template/completeResultPage_data.json",
        "courseListInfo": "../template/courseListInfo.json",
        "complaintView_template": "../template/complaintView_data.json",
        "completeCourseFeedback_template": "../template/completeCourseFeedback_data.json",
        "userDetailInfo": "../template/userDetailInfo.json",
        "resultPage": "../template/courseScore.json",
        "sqhom_test_courseDetailInfo":"../template/sqhom_test_courseDetailInfo.json",
        "scoreUpload": "../template/score_upload.js",
        "getUserAbility":"../template/trainResultView_data.json"
    };


    //return OpenAPI;
    if (!OpenAPI.isLocal) {
        return OpenAPI;
    } else {
        return OpenAPI_local;
    }
});