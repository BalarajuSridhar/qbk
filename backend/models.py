from datetime import datetime

class Question:
    def __init__(self, question_text, question_type, options=None, 
                 correct_answer=None, solution=None, marks=1, 
                 question_html=None, image_path=None):
        self.question_text = question_text
        self.question_html = question_html or question_text
        self.question_type = question_type
        self.options = options or []
        self.correct_answer = correct_answer
        self.solution = solution
        self.marks = marks
        self.image_path = image_path
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
    
    def to_dict(self):
        return {
            'question_text': self.question_text,
            'question_html': self.question_html,
            'question_type': self.question_type,
            'options': self.options,
            'correct_answer': self.correct_answer,
            'solution': self.solution,
            'marks': self.marks,
            'image_path': self.image_path
        }